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
            this.per_page = 50
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
    
    var ArticleListItem = Backbone.View.extend({
        tagName: 'li',
        
        initialize: function() {
            this.template = new Hogan.Template(Templates['article'])        
            this.model.bind('change', this.render, this)
        },

        render: function() {
            $(this.el).append(this.template.render(this.model.toJSON()))
        }
    })

    var ArticleListView = Backbone.View.extend({
        tagName: 'div',
        className: 'result',

        initialize: function() {
            this.model.bind('reset', this.resetArticles, this)
            this.model.bind('add', this.addArticle, this)
            
            console.log(this.model)
            
            $(this.el).html('<div class="loading">Loading…</div>')
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
            $(this.el).html("<section><header>" + this.model.category + "</header></section><ul class='articles list condensed'></ul><div class='load-more'>Load more..</div>")
            this.model.each(this.addArticle, this)
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

    
    var SectionView = Backbone.View.extend({
        tagName: 'div',
        className: 'section',
        
        initialize: function() {
            this.template = new Hogan.Template(Templates['section'])        
            this.model.bind('change', this.render, this)
        },

        render: function() {
            $(this.el).append(this.template.render(this.model.toJSON()))
        }    
    })
    
    var UISectionCarousel = UICarousel.extend({
        initialize: function(params) {
            UICarousel.prototype.initialize.call(this, params)
            
            this.model.bind('add', this.addSection, this)
            this.model.bind('reset', this.resetSections, this)
            
            this.model.fetch()
        },
        
        addSection: function(section) {
            var sectionView = new SectionView({ model: section })
            
            sectionView.render()
        
            this.addPage(sectionView)
        },
        
        resetSections: function() {
            this.model.each(this.addSection, this)
        }
    })
    
    
    var categoryList = new CategoryList()

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
            this.category('overview')
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

            navigationStack.clear()
            navigationStack.push(window.articleListView, true)
            
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
    
    tappable('section', {
        activeClassDelay: 60,
        inactiveClassDelay: 300,    
        onTap: function(event, target) {
            splitView.collapse()        
            applicationRouter.navigate('#' + $(target).data('name'), { trigger: true })
        }
    })
    
    tappable('article', {
        activeClassDelay: 60,    
        inactiveClassDelay: 300,
        onTap:function(event, target) {
            applicationRouter.navigate('#'+ $(target).data('category') +'/'+ $(target).data('article-id'), { trigger: true })
        }
    })

    tappable('.load-more', {
        onTap:function(event, target) {
            
        }
    })

    var applicationRouter = new ApplicationRouter()

    Backbone.history.start({ pushState:true, root: '/mobile/' })
})
}