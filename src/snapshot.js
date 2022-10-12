require('dotenv').config();

const fetch = require('cross-fetch');
const { fromBech32Address } = require('@zilliqa-js/crypto');
const sequelize = require('../models');


const NODE = 'https://api.zilliqa.com';
const CONTRACT = fromBech32Address(process.env.CONTRACT);

async function snapshot() {
  const body = {
    method: 'GetSmartContractSubState',
    params: [CONTRACT.toLowerCase().replace('0x', ''), 'balances', []],
    id: 1,
    jsonrpc: `2.0`
  };
  const res = await fetch(NODE, {
    method: `POST`,
    headers: {
      "Content-Type": `application/json`,
    },
    body: JSON.stringify(body)
  });
  const { result } = await res.json();
  const balances = result['balances'];
  const entries = Object.entries(balances).filter(
    ([, balance]) => BigInt(balance) > BigInt(0)
  );

  return Object.fromEntries(entries);;
}

(async function(){
  const { models } = sequelize.sequelize;
  const state = await snapshot();

  await models.State.drop();
  await models.State.sync();

  const bulks = Object.keys(state).map((key) => ({
    base16: key,
    balance: state[key]
  }));

  await models.State.bulkCreate(bulks);

  // const values = await models.State.findAll();

  // console.log(JSON.stringify(values, null, 4));
}());
