var Feedparser = require('feedparser')
var redis = require('redis').createClient()

var async = require('async')
var sha1 = require('sha1')
var request = require('request')

var moment = require('moment')
var argv = require('optimist').argv

var start = moment()

var total_articles = 0
var article_counter = 0

process.addListener("uncaughtException", function (error) {
    console.log("Uncaught exception: " + error);
    article_parsed();
    console.trace();
});

var categories = require('./config/categories.js')

var active_category = argv.cat

async.forEach(categories, function(category, category_parsed) {

        if(active_category && (category.name != active_category)) {
            category_parsed(); return
        }

/*     if(category.name != 'cars') { category_parsed(); return } */
/*     console.log("============================== START CATEGORY: " + category.name) */

    if(!category.feeds) { category_parsed(); return }

    async.forEachLimit(category.feeds, 16, function(feed, feed_parsed) {
    
        console.log("============================== START FEED: " + feed)    
    
        var feedparser = new Feedparser()
        
        feedparser.on('error', function(error) {
            feed_parsed(error)
        })
        
        feedparser.on('end', function(articles) {
        
            console.log("============================== ARTICLES FOUND: " + articles.length + " IN FEED: " + feed)
            
            total_articles += articles.length
            article_counter += articles.length
        
            async.forEachLimit(articles, 256, function(article, article_parsed) {
            
                if(!article.link) {
                    console.log("----- No Link ----- : " + article.title); article_parsed(); return;
                }
                                
                resolveUrl(article.link, function(error, url) {
                
                    if(error) { console.log("----- Resolve URL Error: " + error); article_parsed(); return }
                
                    getCounts(url, function(error, counts) {
                    
                        if(error) { console.log("----- Get Counts Error: " + error); article_parsed(); return }

                        var article_key = "article:" + sha1(url)
                        var article_published = new Date(article.pubDate).getTime()
                        var article_rank = counts.Twitter + counts.Facebook.total_count + counts.LinkedIn

                        if(article_rank > 0) { // Only save articles with more than one share

                            var article_item = {
                                'article_id': article_key,
                                'url': url,
                                'title': article.title,
                                'description': article.description,
                                'category': category.name,
                                'feed': feed.match(/:\/\/(.[^/]+)/)[1],
                                'source_name': url.match(/:\/\/(.[^/]+)/)[1],
                                'source_url': article.meta.link,
                                'locale': category.locale,
                                'published': article_published,
                                'rank': article_rank,
                                'twitter_count': counts.Twitter,
                                'facebook_count': counts.Facebook.total_count,
                                'linkedin_count': counts.LinkedIn
                            }
            
                            redis.hmset(article_key, article_item, function(error, result) {
                            
                                var day = Math.floor(article_published / (1000 * 60 * 60 * 24))
                                var hour = Math.floor(article_published / (1000 * 60 * 60))

                                if(error) { console.log("----- Error: " + error); article_parsed(); return }
                                else {
                                
                                    redis.sadd('articles:' + article_item.locale + ":" + day, article_key, function(error, result) {
                                        if(error) { console.log("----- Add to list Error: " + error); article_parsed(); return }
                                        else { /* console.log(result) */ }                                    
                                    })
                                    
                                    redis.sadd('articles:hourly:' + hour, article_key, function(error, result) {
                                        if(error) { console.log("----- Add to list Error: " + error); article_parsed(); return }
                                        else { /* console.log(result) */ }                                    
                                    })                                    
                                    
/*                                     console.log("============================== ARTICLE SAVED: " + article.title) */       
                                    article_counter--; console.log(article_counter + " : saved : " + moment(article_published).fromNow() + " : " + article.title)
       
                                    article_parsed()
                                }
                            })
                        } else {
/*                             console.log("============================== ARTICLE SKIPPED: " + article.title) */
                            article_counter--; console.log(article_counter + " : skipped : " + moment(article_published).fromNow() + " : " + article.title)
                            
                            article_parsed()
                        }
                    })    
                })
            }, function(error) {
                // END FOR EACH ARTICLE
                console.log("============================== ALL ARTICLES PARSED: " + feed)
                feed_parsed(error)
            })
        })
        
        feedparser.parseUrl(feed)
    
    }, function(error, articles) {
        // END FOR EACH FEED
        console.log("=============================== ALL FEEDS PARSED: " + category.name)    
        category_parsed()
    })
}, function(error) {
    // END FOR EACH CATEGORY
    console.log("============================== ALL CATEGORIES PARSED ==============================")
    console.log("============================== STATS: " + total_articles + " ARTICLES IN " + start.diff(moment()) + "ms")
    console.log("============================== STATS: " + start.diff(moment()) / total_articles + " MS PER ARTICLE")    
    redis.quit()
})

var proxy_domains = [
    'feedproxy.google.com',
    'rss.feedsportal.com',
    'feeds.nos.nl',
    'feeds.bright.nl',
    'news.google.com',
    'feeds.uitzendinggemist.nl',
    'feeds.webwereld.nl'
]

function resolveUrl(url, callback) {

    var domain = url.match(/:\/\/(.[^/]+)/)[1]
    
    async.any(proxy_domains, function(proxy_domain, proxy_callback) {
        proxy_callback(proxy_domain == domain)
    }, function(result) {

        if(!result) {
            callback(null, url)
        } else {            
            request({'uri': url}, function(error, response, body) {
                if(error) { console.log("----- Request Error: " + error + ": " + url); callback(error, null); return }
            
                callback(null, response.request.uri.href)    
            })
        }
    })
}

function getCounts(url, callback) {
    try {
        request({uri: 'http://api.sharedcount.com/?url=' + encodeURI(url) }, function (error, response, body) {
            if(error) { console.log("----- Get Counts Error: " + error + ": " + url); callback(error, null); return }
                    
            counts = JSON.parse(body)
            
            if(counts.Error) {
                callback(new Error(counts.Error), null); return
            }
        
            callback(null, counts)
        })
    } catch(error) {
        console.log("----- Catched Get Counts Error: " + error); return    
    }
}