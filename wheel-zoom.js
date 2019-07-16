(function JcWheelZoomModule(factory) {
    "use strict";

    window.JcWheelZoom = factory();
})(function JcWheelZoomFactory() {
    /**
     * @class  JcWheelZoom
     * @param  {selector} selector
     * @param  {Object} [options]
     */
    function JcWheelZoom(selector, options) {
        for (var fn in this) {
            if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
                this[fn] = this[fn].bind(this);
            }
        }

        this.image = document.querySelector(selector);
        this.options = options;

        if (this.image !== null) {
            this.container = this.image.parentNode;

            if (this.image.complete) {
                this._prepareImage();
            } else {
                this.image.onload = this._prepareImage
            }
        }
    }

    JcWheelZoom.prototype = {
        constructor: JcWheelZoom,
        image: null,
        image_original_rectangle: null,
        container: null,
        container_original_rectangle: null,
        options: null,
        _prepareImage: function () {
            this.image_original_rectangle = this.image.getBoundingClientRect();
            this.container_original_rectangle = this.container.getBoundingClientRect()

            this.image.style.maxWidth = 'none';

            if (typeof this.options.prepareImage === 'function') {
                this.options.prepareImage();
            }

            this._rescaleImage();

            window.addEventListener('resize', this._rescaleImage);

            this.container.addEventListener('mousewheel', this._rescaleImage);
        },
        _rescaleImage: function (event) {
            var delta = -100000;

            if (typeof event !== 'undefined' && event instanceof WheelEvent) {
                event.preventDefault();

                delta = event.wheelDelta > 0 || event.detail < 0 ? 1 : -1;
            }

            var image_current_rectangle = this.image.getBoundingClientRect();

            var image_original_width = this.image_original_rectangle.width;
            var image_original_height = this.image_original_rectangle.height;

            var container_original_width = this.container_original_rectangle.width;
            var container_original_height = this.container_original_rectangle.height;

            var image_current_width = image_current_rectangle.width;
            var image_current_height = image_current_rectangle.height;

            var scale = image_current_width / image_original_width;
            var min_scale = Math.min(container_original_width / image_original_width, container_original_height / image_original_height);
            var max_scale = 1;
            var new_scale = scale + (delta / (this.options.speed || 20));

            new_scale = (new_scale < min_scale) ? min_scale : (new_scale > max_scale ? max_scale : new_scale);

            // округляем, что бы смягчить скачки значения
            new_scale = new_scale * 100;
            new_scale = Math.round(new_scale);
            new_scale = new_scale / 100;

            var correct_x = Math.round(Math.max(0, (container_original_width - image_original_width * new_scale) / 2));
            var correct_y = Math.round(Math.max(0, (container_original_height - image_original_height * new_scale) / 2));

            this.image.width = image_original_width * new_scale;
            this.image.height = image_original_height * new_scale;

            this.image.style.marginLeft = correct_x + 'px';
            this.image.style.marginTop = correct_y + 'px';

            if (typeof this.options.rescaleImage === 'function') {
                this.options.rescaleImage(new_scale, correct_x, correct_y);
            }

            if (typeof event !== 'undefined' && event instanceof WheelEvent) {
                // var isset_left_scroll = !(!(this.container.scrollWidth - this.container.clientWidth));
                // var isset_top_scroll = !(!(this.container.scrollHeight - this.container.clientHeight));

                var x = Math.round(event.clientX - this.container_original_rectangle.left + this.container.scrollLeft);
                var new_x = Math.round(this.image.width * x / image_current_width);
                var shift_x = new_x - x;

                // if (correct_x > Math.abs(shift_x)) {
                //     this.image.style.marginLeft = (correct_x + shift_x) + 'px';
                // } else if (correct_x > 0) {
                //     this.container.scrollLeft = shift_x + correct_x;
                //     this.image.style.marginLeft = 0;
                // } else {
                this.container.scrollLeft += shift_x;
                // }

                var y = Math.round(event.clientY - this.container_original_rectangle.top + this.container.scrollTop);
                var new_y = Math.round(this.image.height * y / image_current_height);
                var shift_y = new_y - y;

                // if (correct_y > Math.abs(shift_y)) {
                //     this.image.style.marginTop = (correct_y + shift_y) + 'px';
                // } else if (correct_y > 0) {
                //     this.container.scrollTop = shift_y + correct_y;
                //     this.image.style.marginTop = 0;
                // } else {
                this.container.scrollTop += shift_y;
                // }
            }
        }
    };

    /**
     * Create JcWheelZoom instance
     * @param {selector} selector
     * @param {Object} [options]
     */
    JcWheelZoom.create = function (selector, options) {
        return new JcWheelZoom(selector, options);
    };

    // Export
    return JcWheelZoom;
});
