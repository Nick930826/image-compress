import Datastore from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import path from 'path'
import fs from 'fs-extra'
import { app, remote } from 'electron'
import LodashId from 'lodash-id'

// const APP = process.type === 'renderer' ? remote.app : app // 根据process.type判断是main还是renderer调用了该文件
const home = process.env.HOME || (process.env.HOMEDRIVE + process.env.HOMEPATH);
const STORE_PATH = `${home}/.upload_data` // 存到用户目录

// 开发环境下路径已经存在，而在生产环境下这个路径是没有的，所以会报错，这边要创建一个
if (!fs.pathExistsSync(STORE_PATH)) {
  fs.mkdirpSync(STORE_PATH)
}
const adapter = new FileSync(path.join(STORE_PATH, '/data.json')) // 初始化lowdb读写的json文件名以及存储路径
const db = Datastore(adapter) // lowdb接管该文件
db._.mixin(LodashId) // 通过._mixin()引入
// 初始化数据
if (!db.has('imgList').value()) {
  db.set('imgList', []).write()
}
if (!db.has('imgPressList').value()) {
  db.set('imgPressList', []).write()
}

const insert = (filename, data) => {
  db.read().get(filename).insert(data).write()
}
const remove = (filename, by) => {
  db.read().get(filename).remove(by).write()
}
const update = (filename, by, data) => {
  db.read().get(filename).find(by).assign(data).write()
}
const find = (filename, data) => {
  if (data) {
    return db.read().get(filename).find(data).value()
  } else {
    return db.read().get(filename).value()
  }
}
const removeAll = (filename) => {
  db.read().get(filename).remove().write()
}

export default {
  insert,
  remove,
  removeAll,
  update,
  find
} //暴露出去db