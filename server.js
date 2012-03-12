express = require('express')
app = express.createServer()
hulk = require('./library/hulk.js')
async = require('async')
moment = require('moment')
redis = require('redis').createClient()

Feedparser = require('feedparser')

app.configure(function(){
	app.use(express.static(__dirname + '/public'))
/* 	app.use(express.logger()); */
	app.use(express.bodyParser())
	app.use(express.cookieParser())
	app.use(app.router)
	app.use(express.errorHandler({ dumpExceptions:true,showStack:true }))
    app.set('view engine', 'html')
    app.set('views', __dirname + '/public/hogan')
    app.register('.hogan', hulk)
})

categories = require('./config/categories.js')
sorts = [
    { 
        'name': 'velocity',
        'display_name': 'Velocity'
    }, { 
        'name': 'popular',
        'display_name': 'Popular'        
    }, { 
        'name': 'recent',
        'display_name': 'Recent'        
    }
]

locales = [
    {
        'display_name': 'Nederland',
        'locale': 'nl'
    },
    {
        'display_name': 'US',
        'locale': 'us'
    }
]

function fetchArticles(req, res, next) {

    var page = 0
    var per_page = 50
    
    if(req.param('page')) { page = parseInt(req.param('page')) }
    if(req.param('per_page')) { per_page = parseInt(req.param('per_page')) }
    
    var category = req.param('category')
    var sort = req.param('sort')
    var locale = req.param('locale')
    
    var key = 'articles:' + locale + ':' + Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24))

    redis.smembers(key, function(error, article_keys) {
    
        async.map(article_keys, function(article_key, callback) {
        
            redis.hgetall(article_key, function(error, result) {
                
                var delta = new Date().getTime() - result.published
                var velocity = result.rank / delta
                
                bounded_rank = (result.rank > 100) ? 100 : result.rank 
                
                result.velocity = velocity * 1000000
                result.color = 'hsl(' + (100 - bounded_rank) + ', 80%, 50%)' 
                result.relative_date = moment(parseInt(result.published)).fromNow()

                callback(error, result)
            })

        }, function(error, articles) {
            req.articles = articles
            

            async.filter(req.articles, function(article, callback) {
            
                if(category == 'overview') { callback(true) }
                else { callback(article.category == category) }
                
            }, function(filtered_articles) {
                async.sortBy(filtered_articles, function(article, callback) {
                    if(sort == 'popular') {
                        callback(null, -article.rank)
                    }
    
                    else if(sort == 'velocity') {
                        callback(null, -article.velocity)
                    }
                    
                    else if(sort == 'recent') {
                        callback(null, -article.published)
                    }
                    
                    else {
                        callback(null)
                    }
                
                }, function(error, sorted_articles) {
                                                    
                    var start = page * per_page
                    var end = start + per_page
                                        
                    req.pager = {
                        'page': page,
                        'per_page': per_page
                    }

                    var paged_articles = sorted_articles.slice(start, end)
                    
                    req.articles = paged_articles
                    
                    next()
                })
            })
        })
    })
}

function fetchCategories(req, res, next) {
    var active_category = req.param('category')
    var active_locale = req.param('locale')

    async.filter(categories, function(category, filter) {
    
        category.active = (category.name == active_category) ? 'active' : 'inactive'
        filter(category.locale == active_locale)  
    
    }, function(filtered_categories) {
        req.categories = filtered_categories
        
        next()
    })
}

function fetchSorts(req, res, next) {
    var active_sort = req.param('sort')
    
    sorts.forEach(function(sort) {
        (sort.name == active_sort) ? sort.active = 'active' : sort.active = 'inactive'   
    })
    
    req.sorts = sorts
    
    next()
}

function fetchLocales(req, res, next) {
    var active_locale = req.param('locale')
    
    locales.forEach(function(locale) {
        (locale.locale == active_locale) ? locale.active = 'active' : locale.active = 'inactive'
    })
    
    req.locales = locales
    
    next()
}

app.get('/templates.js', hulk.templates)

app.get('/api/:locale/categories', [fetchCategories], function(req, res) {
    res.send(req.categories)
})

app.get('/api/:locale/:category/:sort', [fetchArticles], function(req, res) {

    var response = {
        'pager': req.pager, 
        'result': req.articles
    }

    res.send(response)
})

app.get('/:locale/:category/:sort', [fetchCategories, fetchSorts, fetchLocales, fetchArticles], function(req, res) {

    var active_category = req.param('category')
    var active_sort = req.param('sort')
    var active_locale = req.param('locale')

    res.render("article/list.hogan", {
        locals: {
            'title': "Velocity",
            'articles': req.articles,
            'categories': req.categories,
            'active_category': active_category,
            'sorts': req.sorts,
            'active_sort': active_sort,
            'locales': req.locales,
            'active_locale': active_locale
        }
    })
})

app.get('/mobile', function(req, res) {
    res.render('mobile/index.hogan', {
        layout: 'mobile/layout.hogan'
    })
})

app.listen(3000)