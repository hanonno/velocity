$('document').ready(function() {    
    
    var host = 'http://hanno.hyves.org'
    var host = 'http://light.hyveshq:3000'
    
    var Article = Backbone.Model.extend({
        idAttribute: 'article_id'
    })
    
    var Articles = Backbone.Collection.extend({
        model: Article,

        initialize: function(options) {
            this.category = options.category
            this.sort = options.sort
            this.page = 0
            this.per_page = 10
        },
        
        url: function() {        
            return host + '/api/nl/' + this.category + '/' + this.sort + '?page=' + this.page + '&per_page=' + this.per_page + '&layout=true'
        },
        
        parse: function(response) {
            this.page = response.pager.page + 1
            this.per_page = response.pager.per_page
            this.layout = response.layout
            
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
        idAttribute: 'name',
        
        initialize: function() {
            this.articles = new Articles({ category: this.get('name'), sort: 'recent' })
        }
    })
    
    var Categories = Backbone.Collection.extend({
        model: Category,
                
        url: function() {
            return host + '/api/nl/categories'
        }
    })
    
    var ArticleGridView = Backbone.View.extend({
        tagName: 'div',
        
        initialize: function() {
            this.template = new Hogan.Template(Templates['article_grid'])        
        
            this.model.articles.bind('reset', this.resetArticles, this)
            this.model.articles.bind('complete', this.completed, this)
            
            this.render()            
        },
        
        viewWillAppear: function() {
        
        },
        
        viewDidAppear: function() {
            if(this.isLoaded) { return }
        
            this.model.articles.fetch()
            this.isLoaded = true
        },
        
        completed: function() {
            this.$('.load-more').remove()
        },

/*
        addArticle: function(article) {
            var templateName = article.get('template')
            var template = new Hogan.Template(Templates[templateName])        

            this.$('.articles').append(template.render(article.toJSON()))
            
            this.scrollview.pullToRefreshEnd()
            this.$('.load-more').text("Meer artikelen..")
        },
*/
        
        refresh: function() {
            this.model.refresh()
        },
        
        loadMore: function() {
            this.$('.load-more').text("Laden..")
            this.model.articles.fetch({ add: true })
        },

        resetArticles: function() {            
            var container = this.$('.articles')
        
            container.empty()
            
            var layout = this.model.articles.layout
            var k = 0
            
            for(i = 0; i < layout.length; i++) {
            
                var className = ''

                if(layout[i] == 1) { className = 'single' }
                else if(layout[i] == 2) { className = 'double' }
                else if(layout[i] == 3) { className = 'triple' }
                else if(layout[i] == 4) { className = 'quadruple' }                
            
                var section = $("<section class=" + className + "></section>")
                
                container.append(section)
            
                for(j = 0; j < layout[i]; j++) {
                    var article = this.model.articles.at(k)
                    
                    var template = new Hogan.Template(Templates['article_condensed'])
                    
                    section.append(template.render(article.toJSON()))
                    
                    k++
                }
            }
/*             this.model.articles.each(this.addArticle, this) */
        },
        
        render: function() {
            $(this.el).html(this.template.render({ category: this.model.toJSON(), articles: this.model.articles.toJSON() }))
            
            var self = this
            
            var element = this.$('.scroll-view')[0]
            
            this.scrollview = ScrollOver(element, {
                onPullToRefresh: function() {
                    self.refresh()
                }
            })
        }  
    })
    
    var ArticleListView = Backbone.View.extend({
        tagName: 'div',

        initialize: function() {
            this.template = new Hogan.Template(Templates['article_list'])

            this.model.articles.bind('reset', this.resetArticles, this)
            this.model.articles.bind('add', this.addArticle, this)
            this.model.articles.bind('remove', this.removeArticle, this)
            this.model.articles.bind('complete', this.completed, this)
            
            this.render()
        },
        
        viewWillAppear: function() {
        
        },
        
        viewDidAppear: function() {
            if(this.isLoaded) { return }
        
            this.model.articles.refresh()
            this.isLoaded = true
        },
        
        completed: function() {
            this.$('.load-more').remove()
        },

        addArticle: function(article) {
            var templateName = article.get('template')
            var template = new Hogan.Template(Templates[templateName])        

            this.$('.articles').append(template.render(article.toJSON()))
            
            this.scrollview.pullToRefreshEnd()
            this.$('.load-more').text("Meer artikelen..")
        },
        
        removeArticle: function(article) {
            alert('implement removeArticle')
        },
        
        refresh: function() {
            this.model.articles.refresh()
        },
        
        loadMore: function() {
            this.$('.load-more').text("Laden..")
            this.model.articles.fetch({ add: true })
        },

        resetArticles: function() {        
            this.$('.articles').empty()
            this.model.articles.each(this.addArticle, this)
        },
        
        render: function() {
            $(this.el).html(this.template.render({ category: this.model.toJSON(), articles: this.model.articles.toJSON() }))
            
            var self = this
            
            var element = this.$('.scroll-view')[0]
            
            this.scrollview = ScrollOver(element, {
                onPullToRefresh: function() {
                    self.refresh()
                }
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
        initialize: function(params, layer) {
            UIView.prototype.initialize.call(this, params, layer)
        
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
            var sectionView = new UISectionView({ model: section }, { className: 'section' })
            
            sectionView.render()
        
            this.addPage(sectionView)
        },
        
        resetSections: function() {
            this.model.each(this.addSection, this)
        }
    })
    
    var UIApplication = Backbone.Model.extend({
        initialize: function(params, layer) {
            this.name = params.name
            this.categoryList = new Categories(categories)
            
            this.sectionCarousel = new UISectionCarousel({ model: this.categoryList, x: 0, y: 0, anchor: { left: 0, top: 0, right: 0 }, height: 150 })
            this.navigationStack = new UINavigationStack()

            this.splitView = new UISplitView({ master: this.sectionCarousel, detail: this.navigationStack }, { anchor: { left: 0, top: 0, right: 0, bottom: 0 }})
            this.splitView.collapse()
            
            this.screen = new UIScreen(params, layer)
            
            this.screen.layer.addSublayer(this.splitView.container)
            
            $('body').append(this.screen.el)
            
/*             this.sizeToScreen() */

            var self = this

            $('body').on('orientationchange', function(event) {
                self.sizeToScreen()
            })
            
            tappable('.button-back', {
                noScroll: true,
                onTap: function(event, target) {

                    switch(self.name) {
                        case 'iphone':
                            self.navigationStack.pop()                
                        break;
                        
                        case 'ipad':
                            self.navigationStack.dismissModal()                
                        break;
                    }
                }
            })
        
            tappable('.button-toggle', {
                noScroll: true,
                onTap: function(event, target) {
                    self.splitView.toggle()
                }
            })
            
            tappable('section.nav', {
                activeClassDelay: 60,
                inactiveClassDelay: 300,    
                onTap: function(event, target) {
                    self.showCategory($(target).data('name'))
                }
            })
            
            tappable('article.nav', {
                activeClassDelay: 60,
                inactiveClassDelay: 300,
                onTap:function(event, target) {        
                    self.showArticle($(target).data('article-id'))
                }
            })

            tappable('.load-more', {
                onTap:function(event, target) {
                    self.loadMore()
                }
            })
            
            this.showCategory('telegraaf_frontpage')
        },
        
        showCategory: function(category_name) {
            this.splitView.collapse()
            
            this.activeCategory = this.categoryList.get(category_name)
                        
            if(this.name == 'ipad') {
                this.activeArticleListView = new ArticleGridView({ model: this.activeCategory })            
            } else if(this.name == 'iphone') {
                this.activeArticleListView = new ArticleListView({ model: this.activeCategory })            
            }
                        
            this.navigationStack.clear()
            this.navigationStack.push(this.activeArticleListView, false)
        },
        
        loadMore: function() {
            this.activeArticleListView.loadMore()
        },
        
        showArticle: function(article_id) {
            this.activeArticle =  this.activeCategory.articles.get(article_id)
            this.activeArticleView = new ArticleView({ model: this.activeArticle })
            
            switch(this.name) {
                case 'iphone':
                    this.navigationStack.push(this.activeArticleView)                
                break;
                
                case 'ipad':
                    this.navigationStack.presentModal(this.activeArticleView)                
                break;
            }
        },
        
        sizeToScreen: function() {
            var width = $(window).width()
            var height = $(window).height()
        
            this.screen.layer.frame.x = 0
            this.screen.layer.frame.y = 0            
            this.screen.layer.frame.width = width                
            this.screen.layer.frame.height = height
            
            if(width > height) {
                $(this.screen.layer.element).addClass('landscape')
                $(this.screen.layer.element).removeClass('portrait')                    
            } else {
                $(this.screen.layer.element).addClass('portrait')
                $(this.screen.layer.element).removeClass('landscape')                
            }
            
            this.navigationStack.recalculateLayout(false)        
        }
    })

    if(window.location.search.indexOf('ipad') > 0) {
        var iPadApplication = new UIApplication({ name: 'ipad' }, { x: 0, y: 0, width: 768, height: 1024 })    
    } else if (window.location.search.indexOf('test') > 0) {
        var iPhoneApplication = new UIApplication({ name: 'iphone' }, { x: 0, y: 0, width: 320, height: 460 })    
        var iPadApplication = new UIApplication({ name: 'ipad' }, { x: 340, y: 0, width: 768, height: 1024 })            
    } else {
        var iPhoneApplication = new UIApplication({ name: 'iphone' }, { x: 0, y: 0, width: 320, height: 460 })        
    }
    
})