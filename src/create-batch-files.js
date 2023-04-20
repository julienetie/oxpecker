import path from 'path'
import { readdir, readFile } from 'fs/promises'
import { batchFiles } from './batch-files.js'
const { resolve } = path
const { isArray } = Array
// const rootPath = new URL(path.dirname(import.meta.url)).pathname;

const batchConfigDefaults = {
  minify: false,
  comments: true,
  batch: true,
  ignore: false,
  watch: true,
  invalidate: false
}

const configureBatching = async (jsonConfig, dir) => {
  const config = JSON.parse(jsonConfig)
  console.log('type', typeof config.hasOwn)
  //   const minify = config.hasOwn('minify') ? config.minify : batchConfigDefaults.minify
  //   const comments = config.hasOwn('comments') ? config.comments : batchConfigDefaults.comments
  const batch = Object.hasOwn(config,'batch') ? config.batch : batchConfigDefaults.batch
  const ignore = Object.hasOwn(config, 'ignore') ? config.ignore : batchConfigDefaults.ignore
  //   const watch = config.hasOwn('watch') ? config.watch : batchConfigDefaults.watch
  //   const invalidate = config.hasOwn('invalidate') ? config.invalidate : batchConfigDefaults.invalidate
  const outputFile = config.output
  const { files } = config

  // console.log({
  //     minify,
  //     comments,
  //     batch,
  //     ignore,
  //     watch,
  //     invalidate,
  //     outputFile,
  //     files
  // })
  // Output file name is required
  if (outputFile === undefined) {
    console.error('Missing `output`')
    return
  }

  // Files are required
  if (!isArray(files) || files.length < 1) {
    console.error('Missing `files`')
    return
  }

  if (ignore === true) {
    // @todo check flag to override ignore
    return
  }

  // @todo Invalidate
  // @todo Watch
  // @todo Comments
  // @todo Minify

  if (batch === true) {
    // Bundle files ES
    console.log('Will bundle for: ', outputFile)
    batchFiles(files, outputFile, dir)
  } else {
    // Concatenate files ES
    console.log('Will concat for: ', outputFile)
  }
}

const readBatchConfig = async (batchConfigPath, dir) => {
  const file = await readFile(batchConfigPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    return Buffer.from(data)
  })

  configureBatching(file, dir)
}

/**
 * Find all batch.json files within the parent and sub directories.
 * @param {string} parentDirectory
 */
const findBatchConfigFiles = async parentDirectory => {
  async function * findFiles (dir) {
    const dirents = await readdir(dir, { withFileTypes: true })
    for (const dirent of dirents) {
      const res = resolve(dir, dirent.name)
    //   console.log('dir', res)
      if (dirent.isDirectory()) {
        yield * findFiles(res)
      } else {
        if (dirent.name.startsWith('.batch') && dirent.name.endsWith('.json')) {
          readBatchConfig(res, dir)
          yield res
        }
      }
    }
  }

  for await (const _ of findFiles(parentDirectory));
}

const createBatchFiles = parentDirectory => {
  findBatchConfigFiles(parentDirectory)
}

export { createBatchFiles }