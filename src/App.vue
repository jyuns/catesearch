<template>
  <div id="app">

<div class="spinner" v-if='loading'>
  <div class="rect1"></div>
  <div class="rect2"></div>
  <div class="rect3"></div>
  <div class="rect4"></div>
  <div class="rect5"></div>
</div>

<div class='spinner-wrapper' v-if='loading'/>

    <div class='search-container'>
      <input type='text' v-model="kwd" v-on:keyup.enter='search()' />
      <button @click="search()">검색</button>
    </div>

    <div class='result-container'>
      <div class='result result-wrap' v-for='(value, index) in result' :key="index">
          <div class="result-text-wrap">
            <span class='result-text' >{{value.store}}</span>
            <span class='result-text' >{{value.name}}</span>
            <span class='result-text' >{{value.id}}</span>
          </div>
          <button class='result-copy' @click='copy(value.id)'  :style="{'opacity' : (value.id != 'X')*1}">복사하기</button>
      </div>
    </div>
  </div>
</template>

<script>

const axios = require('axios')

export default {
  name: 'App',
  
  data() {
    return {
      kwd : '',
      result : [],
      loading: false,
    }
  },

  methods : {

    copy(value){
      var dummy = document.createElement("textarea");
      document.body.appendChild(dummy);
      dummy.value = value;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
    },

    async search() {

      this.loading = true

      // Get naver category ID & Name

      try {
        let dataNaver = await axios.post('http://localhost:8086/naver', {query : this.kwd})

        let categoryName = dataNaver.data.categoryName

        let dom = new DOMParser().parseFromString(dataNaver.data.categoryId, 'text/html')
        let cssLength = dom.querySelectorAll('.basicList_depth__2QIie>.basicList_category__wVevj').length
        let tempCategoryId = dom.querySelectorAll('.basicList_depth__2QIie>.basicList_category__wVevj')[cssLength-1].getAttribute("href")
        let categoryId = tempCategoryId.split('=').pop()
        

        this.result[0] = {
          store : '네이버',
          id : categoryId,
          name : categoryName
        }

      } catch {
        this.result[0] = {
          store : '네이버',
          id : 'X',
          name : 'X'
        }
      }

      // Get coupang category ID & Name

      try {
        let dataCoupang = await axios.post('http://localhost:8086/coupang', {query : this.kwd})

        let categoryName = dataCoupang.data.categoryName
        let categoryId = dataCoupang.data.categoryId

        this.result[1] = {
          store : '쿠팡',
          id : categoryId,
          name : categoryName
        }

      } catch {
        this.result[1] = {
          store : '쿠팡',
          id : 'X',
          name : 'X'
        }
      }


      // Get 11st category ID & Name
      try {
        let data11st = await axios.post('http://localhost:8086/11st', {query : this.kwd})

        let dom = new DOMParser().parseFromString(data11st.data, 'text/html')
        
        let tempCategoryNameList = dom.querySelectorAll('.location_box')
        let tempCategoryNameLen = tempCategoryNameList.length
        let categoryName = ''
        let categoryId
        
        for( let i = 0; i < tempCategoryNameLen; i++) {
          // 한글 외의 텍스트 제거, 카테고리 4개 이상일 시 발생되는 에러 해결
          let regex= /[a-z0-9]|[\]{}()<>?|`~!@#$%^&*-_+=,.;:"'\\]/g;
          let tmp = tempCategoryNameList[i].innerText
          let tmpResult = tmp.replace(regex, '')

          categoryName = categoryName + '>' + tmpResult
        }

        categoryId = tempCategoryNameList[tempCategoryNameLen - 1].querySelector('#RefCtgrNo').getAttribute('value')
        
        categoryName = categoryName.split('')
        categoryName.shift()
        categoryName.pop()
        categoryName = categoryName.join('')

        this.result[2] = {
          store : '11번가',
          id : categoryId,
          name : categoryName
        }  
      } catch {
        this.result[2] = {
          store : '11번가',
          id : 'X',
          name : 'X'
        }
      }

      this.$forceUpdate()

      this.loading = false
    }
  }

}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display:flex;
  align-items: center;
  height: 100vh;
}

.search-container {
  display: flex;
  align-items: center;
  justify-content:center;
  padding:16px;
}

.result-container {
  color:white;
}

.result-wrap {
  padding:8px;

  display: flex;
  justify-content: space-between;
}

.result-text {
  margin:0 8px;
}

.spinner {
  width: 200px;
  height: 40px;
  text-align: center;
  font-size: 10px;
  left:42%;
  position:absolute;
  z-index: 10000;
}

.spinner > div {
  background-color: #ffffff;
  height: 100%;
  width: 6px;
  display: inline-block;
  margin:0 4px;
  
  -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
  animation: sk-stretchdelay 1.2s infinite ease-in-out;
}

.spinner .rect2 {
  -webkit-animation-delay: -1.1s;
  animation-delay: -1.1s;
}

.spinner .rect3 {
  -webkit-animation-delay: -1.0s;
  animation-delay: -1.0s;
}

.spinner .rect4 {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}

.spinner .rect5 {
  -webkit-animation-delay: -0.8s;
  animation-delay: -0.8s;
}

@-webkit-keyframes sk-stretchdelay {
  0%, 40%, 100% { -webkit-transform: scaleY(0.4) }  
  20% { -webkit-transform: scaleY(1.0) }
}

@keyframes sk-stretchdelay {
  0%, 40%, 100% { 
    transform: scaleY(0.4);
    -webkit-transform: scaleY(0.4);
  }  20% { 
    transform: scaleY(1.0);
    -webkit-transform: scaleY(1.0);
  }
}

.spinner-wrapper {
position: absolute;
    background: black;
    width: 100%;
    height: 100vh;
    opacity: .3;
    z-index: 9999;
}

.result-copy {
  margin-left: 16px;
  min-width: 100px;
}

.result-text-wrap {
  display: flex;
  min-width: 450px;
  justify-content: space-between;
  width:100%;
}
</style>
