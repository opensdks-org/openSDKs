#!/usr/bin/env node
const {parseArgs} = require('node:util')
const prettier = require('prettier')

async function readStreamToString(/** @type {NodeJS.ReadableStream} */ stream) {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function main() {
  const {
    values: {output},
  } = parseArgs({options: {output: {type: 'string', short: 'o'}}})

  const yaml = await readStreamToString(process.stdin)
  const rawJson = JSON.stringify(require('yaml').parse(yaml))
  const prettyJson = await prettier.format(rawJson, {
    ...require('../prettier.config'),
    parser: 'json',
  })
  if (output) {
    await require('node:fs/promises').writeFile(`${output}.json`, prettyJson)
    await require('node:fs/promises').writeFile(`${output}.yaml`, yaml)
  } else {
    process.stdout.write(prettyJson)
  }
}

void main()