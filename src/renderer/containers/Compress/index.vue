<template>
  <div id="compress">
    <div class="filter">
      <el-button type="primary" @click="handleDeleteAll" icon="el-icon-delete">一键全删</el-button>
    </div>
    <el-upload
      class="upload-demo"
      action=""
      accept='image/*'
      :on-change="fileUpload"
      :show-file-list="false"
      :auto-upload="false"
      :multiple="true"
      :drag="true"
      list-type="picture-card">
      <el-button size="small" type="primary">点击或拖拽上传</el-button>
    </el-upload>
    <div class="demo-image">
      <div class="block" v-for="(img, index) in list" :key="index">
        <span class="demonstration">{{ img.name }}</span>
        <el-image
          style="width: 100px; height: 100px; border: 1px solid #e9e9e9;"
          :src="img.url"
          alt="非图片资源"
          fit="cover"
        >
          <div slot="error" class="image-slot"><span>非图片资源</span></div>
        </el-image>
        <div class="operation">
          <a class="download-a" :href="img.file" :download="img.name"><i class="el-icon-upload2"> </i></a>
          <el-badge :value="img.proportion" class="badge"></el-badge>
          <el-tooltip class="item" effect="dark" content="删除图片" placement="top">
            <i v-on:click="handleDelete(img.id)" class="el-icon-delete"></i>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import lrz from 'lrz'
import { ipcRenderer } from 'electron'
import base64Img from 'base64-img'
export default {
  data: () => {
    return {
      list: [],
      visible: false
    }
  },
  mounted() {
    const self = this
    self.getImgList()
    ipcRenderer.on('insert-success', (event, files) => {
      for (let item in files) {
        const name = files[item].split('/')[(files[item].split('/').length - 1)]
        const result = base64Img.base64Sync(files[item]);
        const file = this.dataURLtoFile(result, name)
        lrz(file)
          .then((rst) => {
              // 处理成功会执行
              console.log('rst', rst)
              const { origin, fileLen, base64, file } = rst
              const proportion = `${((fileLen / origin.size) * 100).toFixed(0)}%` // 压缩比例
              self.$db.insert('imgList',{
                proportion: proportion,
                name: origin.name,
                url: base64,
                file: URL.createObjectURL(file)
              })
              self.getImgList()
          })
      }
    });
  },
  methods: {
    dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
    },
    getImgList() {
      this.list = [].concat(this.$db.find('imgList')) || [] // 数组单纯的替换是无法触发视图的更新的
      console.log(this.list);
    },
    handleDeleteAll() {
      this.$db.removeAll('imgList')
      this.$message({
        message: '删除成功',
        type: 'success',
        center: true
      })
      this.visible = false
      this.getImgList()
    },
    handleDelete(id) {
      this.$db.remove('imgList', { id: id })
      this.$message({
        message: '删除成功',
        type: 'success',
        center: true
      })
      this.getImgList()
    },
    fileUpload: function(file, fileList) {
      const self = this;
      console.log('file', file)
      lrz(file.raw)
        .then((rst) => {
            // 处理成功会执行
            console.log('rst', rst)
            const { origin, fileLen, base64, file } = rst
            const proportion = `${((fileLen / origin.size) * 100).toFixed(0)}%` // 压缩比例
            self.$db.insert('imgList',{
              proportion: proportion,
              name: origin.name,
              url: base64,
              file: URL.createObjectURL(file)
            })
            self.getImgList()
        })
    }
  }
}
</script>

<style lang="less">
  #compress {
    header h1 {
      text-align: center;
      margin: 10px 0;
    }
    .filter {
      padding: 10px 10px;
    }
    .el-upload {
      display: block;
      margin: 0 auto;
      .el-upload-dragger {
        width: 100%;
        margin: 0 auto;
        background: transparent;
        border: none;
      }
    }
    .el-upload--picture-card {
      margin-top: 10px;
      width: 98%;
      height: 170px!important;
    }
    .demo-image {
      display: flex;
      flex-wrap: wrap;
      .block {
        width: 100px;
        display: flex;
        flex-direction: column;
        margin: 10px 10px;
        .el-image {
          margin: 10px 0;
        }
        .demonstration {
          text-align: center;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
    .operation {
      display: flex;
      justify-content: space-around;
      .download-a {
        color: #222333;
      }
      i {
        cursor: pointer;
      }
    }
  }
</style>