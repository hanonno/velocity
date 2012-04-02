/* $('document').ready(function() { */

function application() {

basket
    .require('/javascript/library/scroller/Raf.js')
    .require('/javascript/library/scroller/Animate.js')
    .require('/javascript/library/scroller/Scroller.js')
    .require('/javascript/library/tappable/tappable.js')
    .wait(function() {
    
    var Category = Backbone.Model.extend({
        idAttribute: 'name'
    })
    
    var CategoryList = Backbone.Collection.extend({
        model: Category,
        
        url: function() {
            return '/api/nl/categories'
        }
    })
    
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
            return '/api/nl/' + this.category + '/' + this.sort + '?page=' + this.page + '&per_page=' + this.per_page
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
            this.model.bind('reset', this.resetArticles, this)
            this.model.bind('add', this.addArticle, this)
            this.model.bind('remove', this.removeArticle, this)
            this.model.bind('complete', this.completed, this)
            
            $(this.el).attr('id', 'article-scroll-view')
            $(this.el).html('<div class="loading">Loading…</div>')
            
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
            this.$('.load-more').text("Load more..")
        },
        
        removeArticle: function(article) {
            alert('implement removeArticle')
        },
        
        refresh: function() {
            this.model.refresh()
        },
        
        loadMore: function() {
            this.$('.load-more').text("Loading..")
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
        
            var category = categoryList.get(this.model.category) 
            var category_name = 'test'

            if(category != undefined) {
                category_name = category.get('display_name')
            } else {
                
            }
            
            $(this.el).html("<div class='pull-to-refresh'><div class='ptr-icon'></div></div><section><header>" + category_name + "</header></section><ul class='articles list scrollover-scrollable condensed'></ul><div class='load-more'>Load more..</div>")
            
            var self = this
            
            this.scrollview = ScrollOver(this.el, {
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
            $(this.el).append(this.template.render(this.model.toJSON()))
            
            this.scrollview = ScrollOver(this.el, {
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

    var categoryList = new CategoryList(categories)

    var sectionStack = new UISectionCarousel({ model: categoryList, x: 0, y: 0, width: 320, height: 140 })
    var navigationStack = new UINavigationStack()
    
    var splitView = new UISplitView({ master: sectionStack, detail: navigationStack })
    
    splitView.collapse()
    
    $('#screen').append(splitView.el)

    window.articleListViews = []
    window.articleListView = null

    var ApplicationRouter = Backbone.Router.extend({
        routes: {
            '': 'categories',
            ':category': 'category',
            ':category/:article_id': 'article',
            'expand': 'expand',
            'collapse': 'collapse'
        },

        categories: function() {
            this.category('volkskrant_frontpage')
/*             splitView.expand() */
        },

        category: function(category) {
            window.articleListView = window.articleListViews[category]
            
            var sort = 'recent'
            
            if(category == 'overview') { sort = 'velocity' }
            
            console.log(category)

            if(!articleListView) {
                articleList = new ArticleList({ category: category, sort: sort })
                window.articleListView = new ArticleListView({ model: articleList })
                window.articleListViews[category] = window.articleListView
            }

            navigationStack.clear()
            navigationStack.push(window.articleListView, false)
            
            window.articleListView.viewDidAppear()
        },
        
        article: function(category_name, article_id) {
            articleListView = window.articleListViews[category_name]

            if(!articleListView) {
                articleListView = window.articleListViews['overview']
            }

            var article = articleListView.getModel(article_id)
            
            articleView = new ArticleView({ model: article })
            
            navigationStack.push(articleView)
        },
        
        expand: function() {
            splitView.expand()
        },
        
        collapse: function() {
            splitView.collapse()
        },
        
        pop: function() {
        }
    })
    
    tappable('.button-back', {
        noScroll: true,
        onTap: function(event, target) {
            navigationStack.pop()
        }
    })

    tappable('.button-toggle', {
        noScroll: true,
        onTap: function(event, target) {
            splitView.toggle()
        }
    })
    
    tappable('section.nav', {
        activeClassDelay: 60,
        inactiveClassDelay: 300,    
        onTap: function(event, target) {
            splitView.collapse()        
            applicationRouter.navigate('#' + $(target).data('name'), { trigger: true })
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
})
}