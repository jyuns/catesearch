<template>
  <div id="app">
    <div class='search-container'>
      <input type='text' v-model="kwd" v-on:keyup.enter='search()' />
      <button @click="search()">검색</button>
    </div>

    <div class='result-container'>
      <div class='result result-wrap' v-for='(value, index) in result' :key="index+value.id">
        <span class='result-text'>{{value.store}}</span>
        <span class='result-text'>{{value.name}}</span>
        <span class='result-text'>{{value.id}}</span>
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
    }
  },

  methods : {
    async search() {
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
        this.result[0] = null
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
        this.result[1] = null
      }


      // Get 11st category ID & Name
      let data11st = await axios.post('http://localhost:8086/11st', {query : this.kwd})

      let dom = new DOMParser().parseFromString(data11st.data, 'text/html')
      
      let tempCategoryNameList = dom.querySelectorAll('.location_box')
      let tempCategoryNameLen = tempCategoryNameList.length
      let categoryName = ''
      let categoryId

      for( let i = 0; i < tempCategoryNameLen; i++) {
        categoryName = categoryName + '>' + tempCategoryNameList[i].innerText
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

      this.$forceUpdate()
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
</style>
