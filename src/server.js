const express = require('express');
const nodeApp = express();

const cors = require('cors');
nodeApp.use(cors());

const bodyParser = require('body-parser');
nodeApp.use(bodyParser.json());

const axios = require('axios');

//const os = require('os')
//const homeDir = os.homedir()

const iconv = require('iconv-lite')

nodeApp.post('/naver', async (req, res) => {

    // product link
    let { query } = req.body

    let encodedQuery = encodeURI(query)

    let naverApiUrl = 'https://openapi.naver.com/v1/search/shop.json?query=' + encodedQuery;

    let naverApiRes = await axios.get(naverApiUrl, {
                                            headers : {
                                                'User-Agent' : 'curl/7.49.1',
                                                'Accept' : '*',
                                                'Host' : 'openapi.naver.com',
                                                'X-Naver-Client-Id' : 'zVbXDf2uai2vJIsdWb3I',
                                                'X-Naver-Client-Secret' : 'h724rxl5b4',
                                            }
                                        })
    
    let item = naverApiRes.data.items[0]
    let categoryName = ''

    for(let i = 1; i < 5; i ++) {
        if(item['category' + i] == undefined) continue
        else categoryName = categoryName + '>' + item['category' + i]
    }
    
    categoryName = categoryName.split('')
    categoryName.shift()
    categoryName.pop()
    categoryName = categoryName.join('')

    // cateogry id 
    let itemTitle = item.title
    let itemTitleEncoded = encodeURI(itemTitle)
    let itmeSearchUrl = 'https://search.shopping.naver.com/search/all?query='

    let tempCategoryId = await axios.get(itmeSearchUrl + itemTitleEncoded, {
                        headers : {
                            'User-Agent' : 'Mozila/5.0',
                            'Accept' : '*',
                        }
                    })


    res.json(
        {   
            categoryName : categoryName,
            categoryId : tempCategoryId.data,
        }
    )
})

const https = require('https');
const crypto = require('crypto');

nodeApp.post('/coupang', (req, res) => {
    let { query } = req.body

    const datetime = new Date().toISOString().substr(2,17).replace(/:/gi, '').replace(/-/gi, '') + "Z";
    const method ='POST';
    const path ='/v2/providers/openapi/apis/api/v1/categorization/predict';
    
    const message = datetime + method + path;
    const urlpath = path;
    
    //input your accessKey
    const ACCESS_KEY = "0df73aaf-afd1-46df-a2bf-983215be0ced";
    //input your secretKey
    const SECRET_KEY = "d3aa799a72b96c4bd88a0f2d7f82df553e97fc85";
    const algorithm = 'sha256';
    
    const signature = crypto.createHmac(algorithm, SECRET_KEY)
                        .update(message)
                        .digest('hex');
    
    const authorization = 'CEA algorithm=HmacSHA256, access-key=' + ACCESS_KEY + ', signed-date=' + datetime + ', signature=' + signature;
    
    const strjson = JSON.stringify({
        'productName': query,
        'productDescription' : '해외 직구'
    })
    
    categoryReq(authorization, strjson)
        .then(
            e => res.json({
                categoryId : e.data.predictedCategoryId,
                categoryName : e.data.predictedCategoryName,
            })
        )
        .catch(
            () => res.status(400)
        )
    
    function categoryReq(auth, value) {
        return new Promise(resolve => {
            let body = [];

            let options = {
                hostname: 'api-gateway.coupang.com',
                port: 443,
                path: urlpath,
                method: method,
                headers: {
                  'Content-Type': 'application/json;charset=UTF-8',
                  'Content-Length': Buffer.byteLength(value, 'utf8'),
                  'Authorization': auth,
                  'X-EXTENDED-TIMEOUT':90000
                }
              };

             function callback (response) {
                response.on('data', (chunk) => {
                    body.push(chunk)
                })

                response.on('end', () => {
                    body = Buffer.concat(body).toString()
                    const json = JSON.parse(body)
                    resolve(json)
                })
            }

            let request = https.request(options, callback)

            request.write(value)
            request.end()
        })
    }
})

nodeApp.post('/11st', async (req, res) => {
    let { query } = req.body
    
    let encodedQuery = encodeURI(query)
    let urlEncodedQuery = encodedQuery.split('%').join('%25')

      
    let PIDReq = await axios.get('http://search.11st.co.kr/Search.tmall?method=getSearchFilterAjax&kwd=' + urlEncodedQuery + '&selectedFilterYn=Y&sellerNos=&pageNo=1&fromPrice=&toPrice=&excptKwd=&pageNum=1&pageSize=80&researchFlag=false&lCtgrNo=0&mCtgrNo=0&sCtgrNo=0&dCtgrNo=0&viewType=L&minPrice=&maxPrice=&previousKwd=&previousExcptKwd=&sortCd=NP&firstInputKwd=%C3%BB%B9%D9%C1%F6&catalogYN=N&brandCd=&attributes=&imgAttributes=&benefits=&verticalType=GLOBAL_DIRECT&dispCtgrNo=&dispCtgrType=&officialCertificationSeller=&day11Yn=N&engineRequestUrl=', {
        responseType : 'arraybuffer',
        responseEncoding : 'binary'
    })
    
    let decodePIDReq = iconv.decode(PIDReq.data, 'utf8')
    let JSONdecodePIDReq = JSON.parse(decodePIDReq)

    let PID = JSONdecodePIDReq.commonPrdList.items[0].prdNo

    let categoryReq = await axios.get('http://www.11st.co.kr/product/SellerProductDetail.tmall?method=getSellerProductDetail&prdNo=' + PID, {
        responseType : 'arraybuffer',
        responseEncoding : 'binary'
    })

    let decodeCategoryReq = iconv.decode(categoryReq.data, 'euc-kr')

    res.send(decodeCategoryReq)

})

nodeApp.listen(8086, () => {
    console.log('node listen 8086 port')
})