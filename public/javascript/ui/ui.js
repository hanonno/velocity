var UILayer = Move.require('UILayer')

var UIView = Backbone.View.extend({
    initialize: function(params, layer) {
        this.layer = new UILayer(layer)
        
        // ANDROID BREAKS HERE

        this.el = this.layer.element

        $(this.el).attr('id', params.name)

        Backbone.View.prototype.initialize.call(this, params)
    },
    
    viewWillAppear: function() {},
    viewDidAppear: function() {}
})

var UIScreen = UIView.extend({
    initialize: function(params, layer) {
        layer.className = 'screen'
        
        UIView.prototype.initialize.call(this, params, layer)
    }
})

var UINavigationStack = Backbone.View.extend({

    initialize: function() {
        this.layer = new UILayer({ x: 0, y: 0, anchor: { left: 0, top: 0, right: 0, bottom: 0 }, className: 'stack' })
        this.container = new UILayer({ x: 0, y: 0, anchor: { left:0, bottom: 0, right: 0 }, className: 'navigationStack', masksToBounds: true })
        
        this.layer.addSublayer(this.container)
        
        this.el = this.layer.element
        
        this.createModal()
        this.createPage()
    },
    
    push: function(view, animated) {    
        var layers = this.container.sublayers
        var layer = layers[layers.length - 1]
        
        layer.view = view
        $(layer.element).html(view.el)

        this.container.addSublayer(layer)
        this.createPage()        
        this.recalculateLayout(animated)
    },
    
    pop: function() {
        var layers = this.container.sublayers
        
        layers[layers.length-1].removeFromSuperlayer()

        this.recalculateLayout() 
    },
    
    presentModal: function(view, animated) {
    
        var page = new UILayer({ x: 100, y: 100, width: $(this.container.element).width() - 200, height: $(this.container.element).height() - 200, animated: true, className: 'page' })
/*         var page = new UILayer({ anchor: { left: 100, top: 100, right: 100, bottom: 100 }, animated: true, className: 'page' }) */

        page.view = view
        
        view.viewWillAppear()

/*         view.viewDidAppear() */
        
        $(page.element).html(view.el)
        
        this.modal.addSublayer(page)        

        this.modal.animated = false

        this.modal.frame.x = 0
        this.modal.frame.y = $(this.container.element).height()       
        this.modal.frame.width = $(this.container.element).width()
        this.modal.frame.height = $(this.container.element).height()

        this.modal.animationDuration = 200

        this.modal.frame.y = 0
        
        self = this
        
/*
        page.animated = true;
        page.animationDuration = 2000;
        page.frame.y = 100
*/
    
/*         console.log('present modal') */
    },
    
    dismissModal: function(view, animated) {
        this.modal.frame.y = $(this.container.element).height()
    },
    
    createModal: function() {
        this.modal = new UILayer({ y: 1000, width: 100, height: 100, animated: false, className: 'modal' })
        this.layer.addSublayer(this.modal)
    },
    
    clear: function() {
        _.each(this.container.sublayers, function(layer, index) {
            if(index > 0) {
                layer.removeFromSuperlayer()
            }
        })
        
        this.recalculateLayout(false)
    },
    
    createPage: function() {    
        var page = new UILayer({ x: $(this.container.element).width(), y: 0, anchor: { left: 0, top: 0, right: 0, bottom: 0 }, animated: true, className: 'page' })
        
        page.animationTimingFunction = "ease-out"
        
        page.on('webkitTransitionEnd', function() {
            switch(page.role) {
                case 'placeholder': 
                break

                case 'content':
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

        _.each(layers, function(layer, index, container) {

            var position = count - index

            layer.animated = animated
            
            if(animated) {
                layer.animationDuration = 230
            } else {
                layer.animationDuration = 0
            }

            if(position == 1) {
                layer.frame.x = $(layer.element).width()
                layer.scale = 1
                $(layer.element).addClass('hidden')
                layer.role = 'placeholder'
            } else if (position == 2) {
                layer.view.viewWillAppear()
                layer.frame.x = 0
                layer.scale = 1
                $(layer.element).removeClass('hidden')
                layer.role = 'content'

                if(!animated) {
                    layer.view.viewDidAppear()                    
                }
            } else if (position > 2) {
                layer.frame.x = 0
                layer.scale = 0.9
                layer.role = 'history'
                $(layer.element).addClass('hidden')
            }
        }, this)
    }
})

var UICarousel = UIView.extend({
    initialize: function(params, layer) {
        
        this.pageOffset = 10
        this.pageWidth = 100
        this.pageHeight = this.height - (this.pageOffset * 2)
        
        layer.className = 'ui-carousel'

        UIView.prototype.initialize.call(this, params, layer)
        
        self = this 
        
        this.scroller = new Scroller(function(left, top, zoom) {
            self.recalculateLayout(left)                    
        })        

        this.scroller.setDimensions(0, 0, 960, (this.pageHeight * 2) + (this.pageOffset * 2))
      
        this.layer.on('touchstart', function(event) {
            event.preventDefault()
            self.scroller.doTouchStart([{ pageX: event.pageX, pageY: event.pageY}], event.timeStamp)
        })

        this.layer.on('touchmove', function(event) {
            event.preventDefault()            
            self.scroller.doTouchMove([{ pageX: event.pageX, pageY: event.pageY}], event.timeStamp)
        })

        this.layer.on('touchend', function(event) {
            event.preventDefault()            
            self.scroller.doTouchEnd(event.timeStamp)
        })
        
        this.layer.on('mouseup', function(event) {
            event.preventDefault()            
            self.scroller.doTouchEnd(event.timeStamp)
        })

        this.layer.on('mouseout', function(event) {
            event.preventDefault()            
            self.scroller.doTouchEnd(event.timeStamp)
        })
    },
    
    addPage: function(view) {
        view.layer.frame.y = this.pageOffset
        view.layer.frame.width = this.pageWidth
        view.layer.frame.height = this.pageHeight
    
        this.layer.addSublayer(view.layer)
                    
        this.recalculateLayout(0)
        this.scroller.setDimensions(0, 0, (this.layer.sublayers.length * (self.pageWidth + self.pageOffset)) - 310, this.pageHeight + (this.pageOffset * 2))
        
        return view
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

        _.forEach(this.layer.sublayers, function(page, index, pages) {
            var delta = t - (index * (self.pageWidth + self.pageOffset))
        
            self.updatePosition(page, delta)
        })
    },
    
    scrollToPage: function(index) {            
        this.scroller.scrollTo((this.pageWidth + this.pageOffset) * index, 0, true);
    }
})

var UISplitView = UIView.extend({
    initialize: function(params, layer) {    
        layer.className = 'ui-split-view'
        
        UIView.prototype.initialize.call(this, params, layer)
        
        this.master = params.master.layer
        this.detail = params.detail.layer
        
        this.detail.frame.height = this.layer.frame.height
        
        this.master.animated = true
        this.master.animationDuration = 200

        this.detail.animated = true
        this.detail.animationDuration = 200
        
        this.layer.addSublayer(this.master)
        this.layer.addSublayer(this.detail)
        
/*
        self = this
        
        $(this.el).on('mousemove', function(event, target) {
            self.recalculateLayout(event.y)
        })
*/
        
        this.expand()
    },
    
    recalculateLayout: function(t) {
        this.detail.frame.y = this.master.frame.height * t
    },
    
    toggle: function() {
        if(this.expanded) {
            this.collapse()
        } else {
            this.expand()
        }
    },
    
    expand: function() {
        this.master.scale = 1
        this.master.opacity = 1
        this.detail.frame.y = this.master.frame.height
        this.expanded = true
    },
    
    collapse: function() {
        this.master.scale = 0.9
        this.master.opacity = 0
        this.detail.frame.y = 0
        this.expanded = false            
    }
})