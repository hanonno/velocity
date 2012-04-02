var ScrollOver = function(container, options) {

   var isRefreshing = false;
   var scrollerElement, pullToRefreshElement, labelElement, iconElement;
   var pullText, releaseText, refreshingText;

   function init() {

/*        logging.debug("scrollover init"); */

       options = options || {};

       // raw implementation of hasClass, see http://jsperf.com/has-class/10
       if (!~container.className.split(/\s+/).indexOf("scrollover-wrapper")) {
           container.classList.add("scrollover-wrapper");
       }
       pullToRefreshElement = container.querySelector(".pull-to-refresh");

       if (options.onPullToRefresh && pullToRefreshElement) {
           pullToRefreshElement.style.display = "block";
           scrollerElement = container.querySelector(".scrollover-scrollable");

           iconElement = pullToRefreshElement.querySelector(".ptr-icon");

           pullText = options.pullTextLabel || "Pull down to refresh";
           releaseText = options.releaseTextLabel || "Release to refresh";
           refreshingText = options.refreshingTextLabel || "Refreshing...";

           container.addEventListener("touchend", onTouchEnd, false);
           container.addEventListener("touchmove", onTouchMove, false);
       } else if (pullToRefreshElement) {
           pullToRefreshElement.style.display = "none";
       }

       options.pullLabelHeight = options.pullLabelHeight || 50;

       container.addEventListener("touchstart", onTouchStart, false);
   }

   function onTouchStart(event) {

       var scrollTop = container.scrollTop;
       if (scrollTop <= 0) {
           container.scrollTop = 1;
       }

       if (scrollTop + container.offsetHeight >= container.scrollHeight) {
           container.scrollTop = container.scrollHeight - container.offsetHeight - 1;
       }
   }

   function onTouchMove(event) {

       if (isRefreshing) {
           return;
       }

       var scrollTop = container.scrollTop;
       if (scrollTop < -options.pullLabelHeight && !iconElement.classList.contains("refresh")) {
           iconElement.classList.add("refresh");
       } else if (scrollTop >= -options.pullLabelHeight && container.scrollTop < 0 && iconElement.classList.contains("refresh")) {
           iconElement.classList.remove("refresh");
       }
   }

   function onTouchEnd(event) {

       var scrollTop = container.scrollTop;
       if (isRefreshing || !options.onPullToRefresh || container.scrollTop >= -50) {
           return;
       }

       isRefreshing = true;

       scrollerElement.classList.add("refreshing-list");

       pullToRefreshElement.classList.add("refreshing");
       pullToRefreshElement.classList.add("animate");

       if (options.onPullToRefresh) {
           options.onPullToRefresh();
       }

   }

   /**
    * Callback that will hide the pull-to-refresh element
    */
   function pullToRefreshEnd() {

       if (!pullToRefreshElement) {
           return;
       }

       if (!scrollerElement) {
           return;
       }

       isRefreshing = false;

       pullToRefreshElement.classList.remove("refreshing");
       pullToRefreshElement.classList.remove("animate");

       scrollerElement.classList.remove("refreshing-list");
       scrollerElement.classList.add("refreshing-list-done");
       scrollerElement.addEventListener("webkitTransitionEnd", onScrollerTransitionEnd, true);
   }

   function onScrollerTransitionEnd() {

       scrollerElement.classList.remove("refreshing-list-done");
       scrollerElement.removeEventListener("webkitTransitionEnd", onScrollerTransitionEnd, true);

       iconElement.classList.remove("refresh");
   }

   function destroy() {

/*        logging.debug("scrollover destroy"); */

       container.removeEventListener("touchstart", onTouchStart, false);
       container.removeEventListener("touchend", onTouchEnd, false);
       container.removeEventListener("touchmove", onTouchMove, false);
   }

   function getScrollContainer() {

       return scrollerElement;
   }

   init();

   return  {
       "pullToRefreshEnd": pullToRefreshEnd,
       "getScrollContainer": getScrollContainer,
       "destroy": destroy
   };
};
