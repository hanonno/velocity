module.exports = categories = [
    {
        'name': 'overview',
        'display_name': 'Overzicht',
        'locale': 'nl'
    }, {
        'name': 'news',
        'display_name': 'Nieuws',        
        'locale': 'nl',
        'feeds': [
            'http://news.google.com/news?pz=1&cf=all&ned=nl_nl&hl=nl&output=rss',
        ]
    }, {
        'name': 'tech',
        'display_name': 'Technologie',
        'locale': 'nl',
        'feeds': [
            'http://news.google.com/news?pz=1&cf=all&ned=nl_nl&hl=nl&topic=t&output=rss',
        ]
    }
]