// npm packages
const test = require('tap');
const nock = require('nock');
const Microwork = require('microwork');

// our packages
const startService = require('../src');

// test data
const gameReq = {game: 'Destiny 2'};
const searchResponse = [{id: 4139, name: 'Destiny 2', dist: 0, relation: 'Game'}];
const gameInfoResponse = {
  Reviews: [
    {
      id: 87369,
      title: 'Destiny 2 | Game  Review | Slant Magazine',
      externalUrl: 'http://test.review/destiny-2',
    },
  ],
};

// setup nock search endpoint
nock('http://opencritic.com')
  .get('/api/site/search')
  .query({criteria: gameReq.game.toLowerCase()})
  .reply(200, searchResponse);

// setup nock game info endpoints
nock('http://opencritic.com')
  .get('/api/game')
  .query({id: searchResponse[0].id})
  .reply(200, gameInfoResponse);

nock('http://test.review')
  .get('/destiny-2')
  .reply(
    200,
    `
<html>
  <head>
    <title>Destiny 2 review</title>
  </head>
  <body>
    I am destiny 2 review
  </body>
</html>
`
  );

// main tests
test.test('# OpenCritic input service', it => {
  let cleanup = () => {};
  let testMaster;

  it.test('Should start service', t => {
    (async () => {
      cleanup = await startService();
      testMaster = new Microwork({host: 'localhost', exchange: 'datascience'});
      t.end();
    })();
  });

  it.test('Should process simple game', t => {
    (async () => {
      // listen for reply from workers
      await testMaster.subscribe('store', data => {
        t.equal(data.id, 87369, 'Correct id');
        t.equal(data.title, 'Destiny 2 | Game  Review | Slant Magazine', 'Correct title');
        t.equal(data.externalUrl, 'http://test.review/destiny-2', 'Correct url');
        t.equal(data.text, '\n    I am destiny 2 review\n  \n\n', 'Correct text');
        t.end();
      });
      // send message to workers
      await testMaster.send('opencritic', gameReq);
    })();
  });

  it.test('Should cleanup', t => {
    cleanup();
    testMaster.stop();
    t.end();
  });

  it.end();
});
