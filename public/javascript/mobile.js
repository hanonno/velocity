/* $('document').ready(function() { */

function application() {

basket
    .require('/javascript/library/zepto/zepto.min.js')
    .require('/javascript/library/less/less-1.2.1.min.js')
    .require('/javascript/library/uilayer/move.min.js')
    .require('/javascript/library/uilayer/uilayer.min.js')
    .require('/javascript/library/underscore/underscore.min.js')
    .require('/javascript/library/backbone/backbone.min.js')
    .wait(function() {
    
    /* CATEGORIES */
    var Category = Backbone.Model.extend({
        idAttribute: 'name'
    })
    
    var CategoryList = Backbone.Collection.extend({
        model: Category,
        
        url: function() {
            return '/api/nl/categories'
        }
    })

    var ListItem = Backbone.View.extend({
        events: {
            'touchstart': 'makeActive',
            'touchmove': 'resignActive',
            'touchend': 'resignActive'
        },
    
        makeActive: function() {
            $(this.el).addClass('active')
        },
        
        resignActive: function() {
            $(this.el).removeClass('active')        
        }
    })

    var CategoryListItem = ListItem.extend({
        tagName: 'li',
        templateName: '#category-template',

        initialize: function() {
            this.template = new Hogan.Template(Templates['category'])            
            this.model.bind('change', this.render, this)
    
            self = this            
        },

        events: _.extend({
            'tap': 'openCategory',
        }, ListItem.prototype.events),

        openCategory: function(event) {
            event.preventDefault()
            
            applicationRouter.navigate('#'+this.model.get('name'), { trigger: true })
        },

        render: function() {
            $(this.el).append(this.template.render({ title: this.model.get('display_name') }))
        }
    })

    var CategoryListView = Backbone.View.extend({
        tagName: 'ul',
        className: 'categories list',
        
        initialize: function() {   
            this.model.bind('reset', this.resetCategories, this)
            this.model.bind('all', this.render, this)
        },
        
        viewDidAppear: function() {
            if(this.isLoaded) { return }
        
            this.model.fetch()
            this.isLoaded = true
        },

        addCategory: function(category) {
            var view = new CategoryListItem({ model: category })

            view.render()

            $(this.el).append(view.el)
        },

        resetCategories: function() {
            this.model.each(this.addCategory, this)
        },        
    })
    
    /* ARTICLES */
    var Article = Backbone.Model.extend({
        idAttribute: 'article_id'
    })
    
    var ArticleList = Backbone.Collection.extend({
        model: Article,

        initialize: function(options) {
            this.category = options.category
            this.sort = options.sort
            this.page = 0
            this.per_page = 20
        },
        
        url: function() {        
            return '/api/nl/' + this.category + '/' + this.sort + '?page=' + this.page + '&per_page=' + this.per_page
        },
        
        parse: function(response) {
            this.page = response.pager.page + 1
            this.per_page = response.pager.per_page
        
            return response.result
        }
    })
    
    var ArticleView = Backbone.View.extend({
        tagName: 'div',
        className: 'articles expanded',
        
        initialize: function() {
            this.template = new Hogan.Template(Templates['article'])
            this.model.bind('change', this.render, this)
        },
        
        viewDidAppear: function() {
            this.render()
        },
        
        render: function() {
            $(this.el).append(this.template.render(this.model.toJSON()))
        }
    })

    var ArticleListItem = ListItem.extend({
        tagName: 'li',
        
        initialize: function() {
            this.template = new Hogan.Template(Templates['article'])        
            this.model.bind('change', this.render, this)
        },
        
        events: _.extend({
            'tap': 'openArticle',
        }, ListItem.prototype.events),
        
        openArticle: function(event) {
            applicationRouter.navigate('#'+this.model.get('category')+'/'+this.model.id, { trigger: true })
        },

        render: function() {
/*             $(this.el).append('<div class=\'rank\' style=\'background-color: '+this.model.get('color')+'\'>'+this.model.get('rank')+'</div><div class=\'text\'>'+this.model.get('title')+'</div>') */
            $(this.el).append(this.template.render(this.model.toJSON()))
        }
    })

    var ArticleListView = Backbone.View.extend({
        tagName: 'div',
        className: 'result',

        initialize: function() {
            this.model.bind('reset', this.resetArticles, this)
            this.model.bind('add', this.addArticle, this)
        },
        
        events: {
            'tap .load': 'loadMore'
        },
        
        loadMore: function() {
            this.model.fetch({ add: true })
        },
        
        viewDidAppear: function() {
            if(this.isLoaded) { return }
        
            this.model.fetch()
            this.isLoaded = true
        },

        addArticle: function(article) {
            var view = new ArticleListItem({ model: article })

            view.render()

            this.$('.articles').append(view.el)
        },
        
        getModel: function(id) {
            return this.model.get(id)
        },

        resetArticles: function() {
            $(this.el).html("<ul class='articles condensed'></ul><div class='load'>Load more..</div>")
            this.model.each(this.addArticle, this)
        }
    })

    var UILayer = Move.require('UILayer');
   
    var NavigationView = Backbone.View.extend({

        initialize: function() {
            this.container = new UILayer({ x: 0, y: 0, width: 320, height: 460, masksToBounds: true })
            this.el = this.container.element

/*
            this.container.rotation.x = 20
            this.container.rotation.y = 20
*/

            this.createPage()
        },
        
        push: function(view) {
            var layers = this.container.sublayers
            var page = layers[layers.length - 1]

            page.view = view
            page.content.html(view.el)
            
            if(layers.length > 1) {
             
                var back = UILayer({ x: 0, y: 0, width: 160, height: 42, className: 'button' })
                
                $(back.element).html('<div class="back-button">Back</div>')
                
                var self = this
                
/*
                pable('.back-button', function(event) {
                    self.pop()
                })
*/
                
                back.on('touchend', function(event) {
                    self.pop()
                })
                
                page.addSublayer(back)
            }
                        
            this.container.addSublayer(page)
            this.createPage()
            this.recalculateLayout()
        },
        
        pop: function() {
            var layers = this.container.sublayers
            
            layers[layers.length-1].removeFromSuperlayer()
            this.recalculateLayout() 
            
            applicationRouter.pop()
        },
        
        createPage: function() {
            var page = new UILayer({ x: 320, y: 0, width: 320, height: 460, animated: true, className: 'page' })
            
            var header = $("<div class=\'header\'></div>")
            
            page.header = header; $(page.element).append(header)

            var content = $("<div class=\'content\'></div>")

            page.content = content; $(page.element).append(content)
                        
            page.animationDuration = 230
            page.animationTimingFunction = "ease-out"
            
            page.on('webkitTransitionEnd', function() {
                var role = page.role

                switch(role) {
                    case 'placeholder': 
/*                         page.content.addClass('hidden') */
                        break

                    case 'content':
                        page.content.addClass('scroll')                    
                        page.view.viewDidAppear()
/*                         page.content.removeClass('hidden') */
                        break
                    
                    case 'history':
/*                         page.content.addClass('hidden') */
                        break
                }
            })

            this.container.addSublayer(page)
        },

        recalculateLayout: function() {
            var layers = this.container.sublayers
            var count = layers.length

            _.each(layers, function(layer, index) {

                var position = count - index

                if(position == 1) {
                    layer.frame.x = 320
                    layer.scale = 1
                    layer.content.addClass('hidden')
                    layer.content.removeClass('scroll')
                    layer.role = 'placeholder'
                } else if (position == 2) {
                    layer.frame.x = 0
                    layer.scale = 1
                    layer.content.removeClass('hidden')
                    layer.role = 'content'
                } else if (position > 2) {
                    layer.frame.x = 0
                    layer.scale = 0.9
                    layer.role = 'history'
                    layer.content.addClass('hidden')
                    layer.content.removeClass('scroll')
                }
            })
        }
    })
    
    var navigationView = new NavigationView()
    
    $('#screen').append(navigationView.el)

    var categoryList = new CategoryList()
    var categoryListView = new CategoryListView({ model: categoryList })

    window.articleListViews = []
    window.articleListView = null

    var ApplicationRouter = Backbone.Router.extend({
        routes: {
            '': 'categories',
            ':category': 'category',
            ':category/:article_id': 'article'
        },

        categories: function() {
            categoryListView.viewDidAppear()
        
            navigationView.push(categoryListView) 
        },

        category: function(category) {
            window.articleListView = window.articleListViews[category]
            
            var sort = 'recent'
            
            if(category == 'overview') { sort = 'velocity' }

            if(!articleListView) {
                articleList = new ArticleList({ category: category, sort: sort })
                window.articleListView = new ArticleListView({ model: articleList })
                
                window.articleListViews[category] = window.articleListView
            } 

            navigationView.push(window.articleListView)
        },
        
        article: function(category_name, article_id) {
            articleListView = window.articleListViews[category_name]

            if(!articleListView) {
                articleListView = window.articleListViews['overview']
            }
        
            var article = articleListView.getModel(article_id)
            
            articleView = new ArticleView({ model: article })
            
            navigationView.push(articleView)
        },
        
        pop: function() {
        }
    })

    var applicationRouter = new ApplicationRouter()

    Backbone.history.start({ pushState:true, root: '/mobile/' })
})
/* }) */
}