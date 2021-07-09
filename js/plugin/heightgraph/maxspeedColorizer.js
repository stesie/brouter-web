BR.maxspeedColorizer = function (heightgraph) {
    heightgraph.registerColorizer(
        'maxspeed',
        {
            unknown: {
                text: 'unknown',
                color: '#DDDDDD',
            },
            no_cars: {
                text: 'no cars',
                color: '#53BF56',
            },
            '<=20': {
                text: '≤ 20 km/h',
                color: '#028306',
            },
            '<=30': {
                text: '≤ 30 km/h',
                color: '#7BDD7E',
            },
            '<=50': {
                text: '≤ 50 km/h',
                color: '#ffcc99',
            },
            '<=70': {
                text: '≤ 70 km/h',
                color: '#F29898',
            },
            '<=100': {
                text: '≤ 100 km/h',
                color: '#CF5352',
            },
            '>100': {
                text: '> 100 km/h',
                color: '#AD0F0C',
            },
        },
        function _partitionByMaxspeed(latLng) {
            var wayTag = BR.TrackAnalysis.prototype.parseWayTags(latLng);

            if (['footway', 'path', 'cycleway', 'steps', 'pedestrian'].includes(wayTag.highway)) {
                return 'no_cars';
            }

            // TODO maybe consider cycleway=track (and cycleway:left/right)?

            if (wayTag.maxspeed <= 20) {
                return '<=20';
            }

            if (wayTag.maxspeed <= 30) {
                return '<=30';
            }

            if (wayTag.maxspeed <= 50) {
                return '<=50';
            }

            if (wayTag.maxspeed <= 100) {
                return '<=100';
            }

            if (wayTag.maxspeed > 100 || wayTag.maxspeed === 'none') {
                return '>100';
            }

            return 'unknown';
        }
    );
};
