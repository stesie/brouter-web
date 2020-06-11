BR.Elevation = L.Control.Elevation.extend({
    options: {
        width: $('#map').outerWidth(),
        margins: {
            top: 20,
            right: 30,
            bottom: 30,
            left: 60
        },
        theme: 'steelblue-theme'
    },

    onAdd: function(map) {
        var container = L.Control.Elevation.prototype.onAdd.call(this, map);

        // revert registering touch events when touch screen detection is available and negative
        // see https://github.com/MrMufflon/Leaflet.Elevation/issues/67
        if (L.Browser.touch && BR.Browser.touchScreenDetectable && !BR.Browser.touchScreen) {
            this._background
                .on('touchmove.drag', null)
                .on('touchstart.drag', null)
                .on('touchstart.focus', null);
            L.DomEvent.off(this._container, 'touchend', this._dragEndHandler, this);

            this._background
                .on('mousemove.focus', this._mousemoveHandler.bind(this))
                .on('mouseout.focus', this._mouseoutHandler.bind(this))
                .on('mousedown.drag', this._dragStartHandler.bind(this))
                .on('mousemove.drag', this._dragHandler.bind(this));
            L.DomEvent.on(this._container, 'mouseup', this._dragEndHandler, this);
        }

        return container;
    },

    addBelow: function(map) {
        // waiting for https://github.com/MrMufflon/Leaflet.Elevation/pull/66
        // this.width($('#map').outerWidth());
        this.options.width = $('#content').outerWidth();

        if (this.getContainer() != null) {
            this.remove(map);
        }

        function setParent(el, newParent) {
            newParent.appendChild(el);
        }
        this.addTo(map);
        // move elevation graph outside of the map
        setParent(this.getContainer(), document.getElementById('elevation-chart'));
    },

    update: function(track, layer) {
        this.clear();

        // bring height indicator to front, because of track casing in BR.Routing
        if (this._mouseHeightFocus) {
            var g = this._mouseHeightFocus[0][0].parentNode;
            g.parentNode.appendChild(g);
        }

        var latlngs = track.getLatLngs();

        if (track && latlngs.length > 0) {
            this.options.surfaceLineClassFn = function(_, i) {
                function waytagLookup(tagRe) {
                    var matches = latlngs[i + 1].feature.wayTags.match(tagRe);
                    return matches && matches[1];
                }

                var highwayType = waytagLookup(/highway=(\w+)/);
                var surfaceType = waytagLookup(/surface=(\w+)/);
                var bicycleType = waytagLookup(/bicycle=(\w+)/);

                var isNaturalSurface =
                    surfaceType === 'ground' ||
                    surfaceType === 'dirt' ||
                    surfaceType === 'earth' ||
                    surfaceType === 'grass' ||
                    surfaceType === 'mud' ||
                    surfaceType === 'sand';

                var isBicycle =
                    bicycleType === 'yes' ||
                    bicycleType === 'permissive' ||
                    bicycleType === 'designated' ||
                    waytagLookup(/bicycle_road=(\w+)/) === 'yes' ||
                    waytagLookup(/lcn=(\w+)/) === 'yes';

                if (highwayType === 'path' && (isNaturalSurface || surfaceType === null)) {
                    return 'surface-indicator-trail';
                }

                if (isNaturalSurface) {
                    return 'surface-indicator-forest';
                }

                if (surfaceType === 'gravel' || surfaceType === 'fine_gravel' || surfaceType === 'compacted') {
                    return 'surface-indicator-gravel';
                }

                if (surfaceType === 'paved' || surfaceType === 'asphalt') {
                    if (isBicycle) {
                        return 'surface-indicator-bicycle-road';
                    }

                    return 'surface-indicator-asphalt';
                }

                if (surfaceType === null || surfaceType === 'unknown') {
                    // assumptions, if surface type is not known ...

                    if (highwayType === 'track') {
                        // TODO limit to higher grades only?
                        // maybe grad 1/2 = gravel; 3..5 = forest ?
                        return 'surface-indicator-forest';
                    }

                    if (
                        highwayType === 'motorway' ||
                        highwayType === 'trunk' ||
                        highwayType === 'primary' ||
                        highwayType === 'secondary' ||
                        highwayType === 'tertiary' ||
                        highwayType === 'unclassified'
                    ) {
                        // ... "larger" roads are probably asphalt, even if not mapped so
                        return 'surface-indicator-asphalt';
                    }
                }

                return 'surface-indicator-unknown';
            };

            this.addData(track.toGeoJSON(), layer);

            layer.on('mouseout', this._hidePositionMarker.bind(this));
        }
    }
});
