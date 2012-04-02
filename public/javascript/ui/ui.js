var UILayer = Move.require('UILayer')

var UIView = Backbone.View.extend({
    initialize: function(params) {
        this.layer = new UILayer({x: params.x, y: params.y, width: params.width, height: params.height, className: params.className })
        this.el = this.layer.element
        
        Backbone.View.prototype.initialize.call(this, params)
    }
})

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
        
        page.header.removeAllSublayers()
        
        if(layers.length > 1) {
        
            var self = this            
         
            var back = UILayer({ x: 0, y: 0, width: 160, height: 42, className: 'left' })
            $(back.element).html('<span class="button button-back">Back</span>')
        
            page.header.addSublayer(back)
        }
        
        var toggle = UILayer({ x: 160, y: 0, width: 160, height: 42, className: 'right' })
        $(toggle.element).html('<span class="button button-toggle">Sections</span>')
        
        page.header.addSublayer(toggle)

        this.container.addSublayer(page)
        this.createPage()
        this.recalculateLayout(animated)
    },
    
    pop: function() {
        var layers = this.container.sublayers
        
        layers[layers.length-1].removeFromSuperlayer()
        this.recalculateLayout() 
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
        var page = new UILayer({ x: 320, y: 0, width: 320, height: 460, animated: true, className: 'page' })
        var header = new UILayer({ x: 0, y: 0, width: 320, height: 42, className: 'header' })
        
/*
        var header = $("<div class=\'header\'></div>")
        
        page.header = header; $(page.element).append(header)
*/

        page.header = header
        page.addSublayer(header)
        
        var content = new UILayer({ x: 0, y: 42, width: 320, height: 418, className: 'content' })

        page.content = $(content.element)
        page.addSublayer(content)

/*
        var content = $("<div class=\'content\'></div>")

        page.content = content; $(page.element).append(content)
*/
        page.animationTimingFunction = "ease-out"
        
        page.on('webkitTransitionEnd', function() {
            switch(page.role) {
                case 'placeholder': 
                    break

                case 'content':
/*                     page.content.addClass('scroll') */
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
            } else {
                layer.animationDuration = 0
            }

            if(position == 1) {
                layer.frame.x = 320
                layer.scale = 1
                layer.content.addClass('hidden')
/*                 layer.content.removeClass('scroll') */
                layer.role = 'placeholder'
            } else if (position == 2) {
                layer.view.viewWillAppear()
                layer.frame.x = 0
                layer.scale = 1
                layer.content.removeClass('hidden')
                layer.role = 'content'
            } else if (position > 2) {
                layer.frame.x = 0
                layer.scale = 0.9
                layer.role = 'history'
                layer.content.addClass('hidden')
/*                 layer.content.removeClass('scroll') */
            }
        })
    }
})

var UICarousel = Backbone.View.extend({
    initialize: function(params) {
        this.x = params.x
        this.y = params.y
        this.width = params.width
        this.height = params.height
        
        this.pageWidth = 100
        this.pageHeight = 120
        this.pageOffset = 10
    
        this.container = UILayer({ x: this.x, y: this.y, width: this.width, height: (this.pageHeight * 2), perspective: 1000, className: 'carousel', masksToBounds: true })
        
        self = this            
        
        this.scroller = new Scroller(function(left, top, zoom) {
            self.recalculateLayout(left)                    
        })

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
        view.layer.frame.y = this.pageOffset
        view.layer.frame.width = this.pageWidth
        view.layer.frame.height = this.pageHeight
    
        this.container.addSublayer(view.layer)
                    
        this.recalculateLayout(0)
        this.scroller.setDimensions(0, 0, (this.container.sublayers.length * (self.pageWidth + self.pageOffset)) - 310, this.pageHeight + (this.pageOffset * 2))
        
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

        _.forEach(this.container.sublayers, function(page, index, pages) {
            var delta = t - (index * (self.pageWidth + self.pageOffset))
        
            self.updatePosition(page, delta)
        })
    },
    
    scrollToPage: function(index) {            
        this.scroller.scrollTo((this.pageWidth + this.pageOffset) * index, 0, true);
    }
})

var UISplitView = Backbone.View.extend({
    initialize: function(params) {
        this.container = new UILayer({ x: 0, y: 0, width: 320, height: 460, masksToBounds: true, className: 'splitView' })
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
/*         this.master.scale = 1 */
        this.master.opacity = 1
        this.detail.frame.y = 140
        this.expanded = true
    },
    
    collapse: function() {
/*         this.master.scale = 0.9 */
        this.master.opacity = 0
        this.detail.frame.y = 0
        this.expanded = false            
    }
})