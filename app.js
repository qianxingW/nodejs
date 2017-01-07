/*
 * @Author: Marte
 * @Date:   2017-01-07 09:37:57
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-01-07 15:24:42
 */

var http = require("http"); // http 网路

var cheerio = require("cheerio"); //html 解析

var fs = require("fs"); //流

// 目标网址（百度音乐最热歌单）
// http://music.baidu.com/songlist/tag/%E5%85%A8%E9%83%A8?orderType=1&offset=0&third_type=
var startHref = "http://music.baidu.com/songlist/tag/%E5%85%A8%E9%83%A8?orderType=1&offset=";

// 歌单路径
var urls = [];
// 歌曲详情和总数
var song = [];
/**
 * 获取网站信息
 * @param res.setEncoding('utf8');
 */
function getHtml(href, page) {
    console.log(page)
    var html = ""; //html
    var req = http.get(href + page + '&third_type=', function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            html += chunk;
        });
        res.on('end', function() {
            // 解析html
            var $ = cheerio.load(html);
            //将每页歌单的url保存起来
            var songListData = $('.main-body .songlist-list ul li').find('.text-title>a').toArray();
            for (var i = 0; i < songListData.length; i++) {
                var link = songListData[i].attribs.href;
                urls.push(songListData[i].attribs.href);
            };
            if (page == maxPage) {
                console.log("歌单路径获取完成：" + urls.length);
                console.log("歌单数量：" + urls.length);
                if (urls.length > 0) {
                    getSongInfo(urls.shift());
                } else {
                    console.leg("已完成！")
                }
            }

        })
    })
};
/**
 *获取每页歌单详细信息
 *@param {int}： songUrl
 */
function getSongInfo(songUrl) {
    var html = "";
    var req = http.get("http://music.baidu.com" + songUrl, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            html += chunk;
        });
        res.on("end", function() {
            var $ = cheerio.load(html);
            // 歌单名称
            var songTitle = $(".songlist-left .songlist-info-box").find("h1").html(),
                songlistData = $(".song-list .song-item");
            for (var i = 0; i < songlistData.length; i++) {
                var songData = {
                    /* 歌曲名   trim为了去除空格*/
                    songName: $(songlistData[i]).children('.song-title').find('a').text().trim(),
                    /* 歌手 */
                    songSinger: $(songlistData[i]).children('.singer').find('span').text().trim(),
                    /* 专辑名 */
                    songAlbum: $(songlistData[i]).children('.album-title').find('a').text().trim(),
                };
                song.push(songData);
                console.log(songData.songName)
            };
            if (urls.length > 0) {
                getSongInfo(urls.shift());
            } else {
                console.log("已完成：歌曲数目" + song.length);

                //song 是所有歌曲的集合，包括歌名、歌手、专辑
                //由于是新手还不会将他显示在页面上，只能显示在命令行中
                // console.log(song)
            }
        });

    });
};

/**
 * 开始执行
 * 前三页的歌单
 * 由于他的页数每次多20所以i+=20
 */
var maxPage = 40;

function start() {
    console.log("开始获取歌单！");
    for (var i = 0; i <= maxPage; i += 20) {
        getHtml(startHref, i);
    }
};
start()