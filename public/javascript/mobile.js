/* $('document').ready(function() { */

function application() {

basket
    .require('/javascript/library/zepto/zepto.min.js')
    .require('/javascript/library/less/less-1.2.1.min.js')
    .require('/javascript/library/uilayer/move.min.js')
    .require('/javascript/library/uilayer/uilayer.min.js')
    .require('/javascript/library/scroller/Raf.js')
    .require('/javascript/library/scroller/Animate.js')
    .require('/javascript/library/scroller/Scroller.js')
    .require('/javascript/library/tappable/tappable.js')            
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
            'touchend': 'resignActive',
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
            this.per_page = 10
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
        
        openArticle: function(event) {
            applicationRouter.navigate('#'+this.model.get('category')+'/'+this.model.id, { trigger: true })
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
            $(this.el).html("<ul class='articles list condensed'></ul><div class='load-more'>Load more..</div>")
            this.model.each(this.addArticle, this)
        }
    })

    var UILayer = Move.require('UILayer');
       
    var UINavigationStack = Backbone.View.extend({

        initialize: function() {
            this.container = new UILayer({ x: 0, y: 0, width: 320, height: 460, className: 'navigationStack', masksToBounds: true })
            this.el = this.container.element

            this.createPage()
        },
        
        push: function(view, animated) {
            var layers = this.container.sublayers
            var page = layers[layers.length - 1]

            page.view = view
            page.content.html(view.el)
            
            if(layers.length > 1) {
            
                var self = this            
             
                var back = UILayer({ x: 0, y: 0, width: 160, height: 42, className: 'left' })
                $(back.element).html('<span class="button button-back">Back</span>')
            
                
                page.addSublayer(back)
            }
            
            var toggle = UILayer({ x: 160, y: 0, width: 160, height: 42, className: 'right' })
            $(toggle.element).html('<span class="button button-toggle">Sections</span>')

            toggle.on('touchstart', function(event) {
                this.addClass('active')
            })
            
            page.addSublayer(toggle)

            this.container.addSublayer(page)
            this.createPage()
            this.recalculateLayout(animated)
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
            page.animationTimingFunction = "ease-out"
            
            page.on('webkitTransitionEnd', function() {
                var role = page.role

                switch(role) {
                    case 'placeholder': 
                        break

                    case 'content':
                        page.content.addClass('scroll')                    
                        page.view.viewDidAppear()
                        break
                    
                    case 'history':
                        break
                }
            })

            this.container.addSublayer(page)
        },

        recalculateLayout: function(animated) {
        
            if (typeof animated == "undefined") {
                animated = true            
            }
        
            var layers = this.container.sublayers
            var count = layers.length

            _.each(layers, function(layer, index) {

                var position = count - index

                layer.animated = animated
                
                if(animated) {
                    layer.animationDuration = 230
                }

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
    
    var UICarousel = Backbone.View.extend({
        initialize: function(params) {
            this.x = params.x
            this.y = params.y
            this.width = params.width
            this.height = params.height
            
            this.pageWidth = 110
            this.pageHeight = 120
            this.pageOffset = 10
        
            this.container = UILayer({ x: this.x, y: this.y, width: this.width, height: (this.pageHeight * 2), perspective: 1000, className: 'carousel', masksToBounds: true })
            
            self = this            
            
            this.scroller = new Scroller(function(left, top, zoom) {
                self.recalculateLayout(left)                    
            });

            this.scroller.setDimensions(0, 0, 960, (this.pageHeight * 2) + (this.pageOffset * 2))
                            
            this.container.on('touchstart', function(event) {
                event.preventDefault()
                self.scroller.doTouchStart([{ pageX: event.pageX, pageY: event.pageY}], event.timeStamp)
            })

            this.container.on('touchmove', function(event) {
                event.preventDefault()            
                self.scroller.doTouchMove([{ pageX: event.pageX, pageY: event.pageY}], event.timeStamp)
            })

            this.container.on('touchend', function(event) {
                event.preventDefault()            
                self.scroller.doTouchEnd(event.timeStamp)
            })
            
            this.container.on('mouseup', function(event) {
                event.preventDefault()            
                self.scroller.doTouchEnd(event.timeStamp)
            })

            this.container.on('mouseout', function(event) {
                event.preventDefault()            
                self.scroller.doTouchEnd(event.timeStamp)
            })
        },
        
        addPage: function(view) {
            var page = this.container.addSublayer(UILayer({ x: 10, y: 10, width: this.pageWidth, height: this.pageHeight, className: 'section' }))
            
            $(page.element).html(view.el)
            
            page.view = view
            
            self = this
            
            page.on('tap', function(event) {
                event.preventDefault()
                this.view.click()
/*                 self.scrollToPage(self.container.sublayers.indexOf(this)); */
            })
            
            this.recalculateLayout(0)
            
            this.scroller.setDimensions(0, 0, (this.container.sublayers.length * (self.pageWidth + self.pageOffset)) - 310, this.pageHeight + (this.pageOffset * 2))
            
            return page
        },
        
        updatePosition: function(page, t) {  
        
            width = this.pageWidth

            offsetX = 10 /* Distance from left edge */

            if(t > 0) { /* Disappear */
                page.frame.z = -t
                page.frame.x = (-(t * 0.32) + offsetX)
/*                 page.opacity = 1 - (t / (4 * 420)) */
            } else { /* Scrolling */
                page.frame.z = 0
                page.frame.x = -t + offsetX
                page.opacity = 1
            }            
        },
        
        recalculateLayout: function(t) {  
        
            self = this

            _.forEach(this.container.sublayers, function(page, index, pages) {
                var delta = t - (index * (self.pageWidth + self.pageOffset))
            
                self.updatePosition(page, delta)
            })
            
/*
            this.container.sublayers.each(function(page, index, pages) {
                this.updatePosition {page: page, t: ))}
            })
*/
        },
        
        scrollToPage: function(index) {            
            this.scroller.scrollTo((this.pageWidth + this.pageOffset) * index, 0, true);
        }
    })

    var UISectionCarousel = UICarousel.extend({
        initialize: function(params) {
            UICarousel.prototype.initialize.call(this, params)
            
            this.model.bind('add', this.addSection, this)
            this.model.bind('reset', this.resetSections, this)
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
    
    var UISplitView = Backbone.View.extend({
        initialize: function(params) {
            this.container = new UILayer({ x: 0, y: 0, width: 320, height: 460, className: 'splitView' })
            this.el = this.container.element
            
            this.master = params.master.container
            this.detail = params.detail.container
            
            this.master.animated = true
            this.master.animationDuration = 200 
            this.detail.animated = true
            this.detail.animationDuration = 200
            
            this.container.addSublayer(this.master)
            this.container.addSublayer(this.detail)
            
            this.expand()
        },
        
        toggle: function() {
            if(this.expanded) {
                this.collapse()
            } else {
                this.expand()
            }
        },
        
        expand: function() {
            this.detail.frame.y = 140
            this.expanded = true
        },
        
        collapse: function() {
            this.detail.frame.y = 0
            this.expanded = false            
        }
    })

    var categoryList = new CategoryList()
    var categoryListView = new CategoryListView({ model: categoryList })

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

            categoryListView.viewDidAppear()
/*             navigationStack.push(categoryListView) */

            this.category('overview')
        },

        category: function(category) {
            splitView.collapse()
        
            window.articleListView = window.articleListViews[category]
            
            var sort = 'recent'
            
            if(category == 'overview') { sort = 'velocity' }

            if(!articleListView) {
                articleList = new ArticleList({ category: category, sort: sort })
                window.articleListView = new ArticleListView({ model: articleList })
                window.articleListViews[category] = window.articleListView
            } 

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
    
    tappable('section', {
        activeClassDelay: 60,
        inactiveClassDelay: 300,    
        onTap: function(event, target) {
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