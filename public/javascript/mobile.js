$('document').ready(function() {
    
/*     var host = 'http://hanno.hyves.org' */
    var host = 'http://light.hyveshq:3000'
    
    var Article = Backbone.Model.extend({
        idAttribute: 'article_id'
    })
    
    var ArticleList = Backbone.Collection.extend({
        model: Article,

        initialize: function(options) {
            this.category = options.category
            this.sort = options.sort
            this.page = 0
            this.per_page = 10
        },
        
        url: function() {        
            return host + '/api/nl/' + this.category + '/' + this.sort + '?page=' + this.page + '&per_page=' + this.per_page
        },
        
        parse: function(response) {
            this.page = response.pager.page + 1
            this.per_page = response.pager.per_page
            
            if(response.result.length < response.pager.per_page) {
                this.trigger('complete')
            }
        
            return response.result
        },
        
        refresh: function() {
            this.reset()
            this.page = 0
            this.fetch()
        }
    })
    
    var Category = Backbone.Model.extend({
        idAttribute: 'name'
    })
    
    var CategoryList = Backbone.Collection.extend({
        model: Category,
        
        url: function() {
            return host + '/api/nl/categories'
        }
    })
    
    var ArticleListItem = Backbone.View.extend({
        tagName: 'li',
        
        initialize: function() {
            var template = this.model.get('template')
        
            this.template = new Hogan.Template(Templates[template])        
            this.model.bind('change', this.render, this)
        },

        render: function() {
            $(this.el).append(this.template.render(this.model.toJSON()))
        }
    })

    var ArticleListView = Backbone.View.extend({
        tagName: 'div',

        initialize: function() {
            this.template = new Hogan.Template(Templates['article_list'])        
        
            this.model.bind('reset', this.resetArticles, this)
            this.model.bind('add', this.addArticle, this)
            this.model.bind('remove', this.removeArticle, this)
            this.model.bind('complete', this.completed, this)
            
/*             $(this.el).attr('id', 'article-scroll-view') */
/*             $(this.el).html('<div class="loading">Loading…</div>') */
            
            this.render()
        },
        
        viewWillAppear: function() {
        
        },
        
        viewDidAppear: function() {
            if(this.isLoaded) { return }
        
            this.model.fetch()
            this.isLoaded = true
        },
        
        completed: function() {
            this.$('.load-more').remove()
        },
        
        addArticle: function(article, index) {
            var view = new ArticleListItem({ model: article })

            view.render()

            this.$('.articles').append(view.el)
            
            this.scrollview.pullToRefreshEnd()
            this.$('.load-more').text("Meer artikelen..")
        },
        
        removeArticle: function(article) {
            alert('implement removeArticle')
        },
        
        refresh: function() {
            this.model.refresh()
        },
        
        loadMore: function() {
            this.$('.load-more').text("Laden..")
            this.model.fetch({ add: true })
        },
        
        getModel: function(id) {
            return this.model.get(id)
        },

        resetArticles: function() {
            this.$('.articles').empty()
            this.model.each(this.addArticle, this)
        },
        
        render: function() {
        
            /* TODO: articles should be in sections */
        
            var category = application.categoryList.get(this.model.category) 
            var category_name = 'voorpagina'

            if(category != undefined) {
                category_name = category.get('display_name')
            } else {
                
            }

            $(this.el).html(this.template.render())
            
/*             $(this.el).html("<section><header>" + category_name + "<span class='date'></span></header></section><div class='scroll-view has-header'><div class='pull-to-refresh'><div class='ptr-icon'></div></div><ul class='articles list scrollover-scrollable condensed'></ul><div class='load-more'>Meer artikelen..</div></div>") */
            
            var self = this
            
            var element = this.$('.scroll-view')[0]
            
            this.scrollview = ScrollOver(element, {
                onPullToRefresh: function() {
                    self.refresh()
                }
            })
            
            var self = this
            
            this.$('.load-more').on('click', function() {
                self.loadMore()
            })
        }
    })
    
    var ArticleView = Backbone.View.extend({
        tagName: 'div',
        className: 'article',
        
        initialize: function() {
            this.template = new Hogan.Template(Templates['article_expanded'])
            this.model.bind('change', this.render, this)
        },
        
        viewWillAppear: function() {
            this.render()        
        },
        
        viewDidAppear: function() {

        },
        
        render: function() {
            $(this.el).html(this.template.render(this.model.toJSON()))
            
            var element = this.$('.scroll-view')[0]
            
            this.scrollview = ScrollOver(element, {
                onPullToRefresh: function() {
                    alert('test')
                }
            })
        }
    })
    
    var UISectionView = UIView.extend({        
        initialize: function(params) {
            UIView.prototype.initialize.call(this, params)
        
            this.template = new Hogan.Template(Templates['section'])        
            this.model.bind('change', this.render, this)
        },

        render: function() {
            $(this.el).html(this.template.render(this.model.toJSON()))
        }
    })
    
    var UISectionCarousel = UICarousel.extend({
        initialize: function(params) {
            UICarousel.prototype.initialize.call(this, params)
            
            this.model.bind('add', this.addSection, this)
            this.model.bind('reset', this.resetSections, this)
            
            this.resetSections()
        },
        
        addSection: function(section) {
            var sectionView = new UISectionView({ model: section, className: 'section' })
            
            sectionView.render()
        
            this.addPage(sectionView)
        },
        
        resetSections: function() {
            this.model.each(this.addSection, this)
        }
    })
    
    var UIApplication = Backbone.Model.extend({
        initialize: function(params) {
            this.categoryList = new CategoryList(categories) 
            
            this.sectionCarousel = new UISectionCarousel({ model: this.categoryList, x: 0, y: 0, anchor: { left: 0, top: 0, right: 0 }, height: 150 })
            this.navigationStack = new UINavigationStack()

            this.splitView = new UISplitView({ master: this.sectionCarousel, detail: this.navigationStack })
            this.splitView.collapse()
            
            $('body').append(this.splitView.el)
        },
        
        showCategory: function(category) {
            this.splitView.collapse()
                        
            window.articleListView = window.articleListViews[category]
            
            var sort = 'recent'
            
            if(category == 'overview') { sort = 'velocity' }    

            if(!articleListView) {
                articleList = new ArticleList({ category: category, sort: sort })
                window.articleListView = new ArticleListView({ model: articleList })
                window.articleListViews[category] = window.articleListView
            }

            this.navigationStack.clear()
            this.navigationStack.push(window.articleListView, false)
            
            window.articleListView.viewDidAppear()
        }
    })

    var application = new UIApplication()

    window.articleListViews = []
    window.articleListView = null

    var ApplicationRouter = Backbone.Router.extend({
        routes: {
            '': 'categories',
            ':category': 'category',
            ':category/:article_id': 'article',
        },

        categories: function() {
            this.category('volkskrant_frontpage')
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

/*             application.navigationStack.clear() */
            application.navigationStack.push(window.articleListView, false)
            
            window.articleListView.viewDidAppear()
        },
        
        article: function(category_name, article_id) {
            articleListView = window.articleListViews[category_name]

            if(!articleListView) {
                articleListView = window.articleListViews['overview']
            }

            var article = articleListView.getModel(article_id)
            
            articleView = new ArticleView({ model: article })
            
            application.navigationStack.push(articleView)
        }        
    })
    
    tappable('.button-back', {
        noScroll: true,
        onTap: function(event, target) {
            application.navigationStack.pop()
        }
    })

    tappable('.button-toggle', {
        noScroll: true,
        onTap: function(event, target) {
            application.splitView.toggle()
        }
    })
    
    tappable('section.nav', {
        activeClassDelay: 60,
        inactiveClassDelay: 300,    
        onTap: function(event, target) {
            application.showCategory($(target).data('name'))
        }
    })
    
    tappable('article.nav', {
        activeClassDelay: 60,    
        inactiveClassDelay: 300,
        onTap:function(event, target) {
            applicationRouter.navigate('#'+ $(target).data('category') +'/'+ $(target).data('article-id'), { trigger: true })
        }
    })

/*
    tappable('.load-more', {
        onTap:function(event, target) {

        }
    })
*/

    var applicationRouter = new ApplicationRouter()

    Backbone.history.start({ pushState:true, root: '/mobile/' })
    
    applicationRouter.category('overview')
    
})