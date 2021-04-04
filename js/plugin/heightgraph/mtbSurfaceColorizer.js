BR.mtbSurfaceColorizer = function (heightgraph) {
    heightgraph.registerColorizer(
        'mtb-surface',
        {
            unknown: {
                text: 'unknown',
                color: 'grey',
            },
            trail: {
                text: 'trail',
                color: 'red',
            },
            natural: {
                text: 'natural/forest',
                color: 'goldenrod',
            },
            gravel: {
                text: 'gravel',
                color: 'green',
            },
            'bicycle-road': {
                text: 'bicycle-road',
                color: 'purple',
            },
            asphalt: {
                text: 'asphalt',
                color: 'royalblue',
            },
        },
        function _partitionBySurface(latLng) {
            var wayTag = BR.TrackAnalysis.prototype.parseWayTags(latLng);

            var highwayType = wayTag.highway;
            var surfaceType = wayTag.surface;
            var bicycleType = wayTag.bicycle;

            var isNaturalSurface =
                surfaceType === 'ground' ||
                surfaceType === 'dirt' ||
                surfaceType === 'earth' ||
                surfaceType === 'grass' ||
                surfaceType === 'mud' ||
                surfaceType === 'sand';

            var isBicycle =
                // bicycleType === 'yes' ||
                bicycleType === 'permissive' ||
                bicycleType === 'designated' ||
                wayTag.bicycle_road === 'yes' ||
                wayTag.lcn === 'yes';

            if (highwayType === 'path' && !isBicycle && (isNaturalSurface || surfaceType === null)) {
                return 'trail';
            }

            if (isNaturalSurface) {
                return 'natural';
            }

            if (surfaceType === 'gravel' || surfaceType === 'fine_gravel' || surfaceType === 'compacted') {
                return 'gravel';
            }

            if (surfaceType === 'paved' || surfaceType === 'asphalt') {
                if (isBicycle) {
                    return 'bicycle-road';
                }

                return 'asphalt';
            }

            if (surfaceType === null || surfaceType === 'unknown') {
                // assumptions, if surface type is not known ...

                if (highwayType === 'track') {
                    // TODO limit to higher grades only?
                    // maybe grad 1/2 = gravel; 3..5 = forest ?
                    return 'natural';
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
                    return 'asphalt';
                }
            }

            return 'unknown';
        }
    );
};
