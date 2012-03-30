module.exports = categories = [
    {  
        'name': 'overview',
        'display_name': 'Voorpagina',
        'locale': 'nl'
    }, {
        'name': 'overview',
        'display_name': 'Overview',
        'locale': 'us'
    }, {
        'name': 'news',
        'display_name': 'Nieuws',        
        'locale': 'nl',
        'feeds': [
            'http://news.google.com/news?pz=1&cf=all&ned=nl_nl&hl=nl&output=rss',
            'http://rss.fok.nl/feeds/nieuws',
            'http://rss.feedsportal.com/c/585/fe.ed/www.telegraaf.nl/rss/index.xml',
            'http://www.nu.nl/feeds/rss/algemeen.rss',
            'http://www.volkskrant.nl/rss.xml',
            'http://feeds.nrcnext.nl/nrcnext-blog',
            'http://feeds.nos.nl/nosmyheadlines',
            'http://www.ad.nl/rss.xml',
            'http://www.nrc.nl/rss.php',
            'http://www.nrc.nl/nieuws/categorie/beste-van-het-web/rss.php',
            'http://www.zie.nl/rss/list/426',
            'http://feeds.webwereld.nl/webwereld',
            'http://www.infonu.nl/rss/rss-nieuws-uitgelicht.rss',
            'http://www.trouw.nl/rss.xml'              
        ]
    }, {
        'name': 'tech',
        'display_name': 'Technologie',
        'locale': 'nl',
        'feeds': [
            'http://news.google.com/news?pz=1&cf=all&ned=nl_nl&hl=nl&topic=t&output=rss',
            'http://feeds.feedburner.com/tweakers/mixed',
            'http://feeds.bright.nl/brightmagazine',
            'http://www.dutchcowboys.nl/news_feeds/index.xml',
            'http://feeds2.feedburner.com/iPhoneclub',
            'http://www.nu.nl/feeds/rss/tech.rss',
        ]
    }, {
        'name': 'tech',
        'display_name': 'Tech',
        'locale': 'us',
        'feeds': [ 'http://www.techmeme.com/feed.xml', 'http://www.engadget.com/rss.xml', 'http://feeds.feedburner.com/TechCrunch/', 'http://www.theverge.com/rss/index.xml', 'http://pandodaily.com/feed/', 'http://www.mondaynote.com/feed/' ]
    }, {
        'name': 'apple',
        'display_name': 'Apple',
        'locale': 'us',
        'feeds': [ 'http://reverttosaved.com/feed', 'http://daringfireball.net/index.xml', 'http://feeds.feedburner.com/shawnblanc/', 'http://feeds.feedburner.com/loopinsight/KqJb', 'http://feeds.feedburner.com/Asymco/', 'http://inspiredbyapple.tumblr.com/rss' ]    
    }, {
        'name': 'design',
        'display_name': 'Design',
        'locale': 'us',
        'feeds': [ 'http://adaptivepath.com/rss', 'http://feeds.feedburner.com/FunctioningForm', 'http://littlebigdetails.com/rss', 'http://dribbble.com/hanonno/shots/following.rss', 'http://feeds.feedburner.com/mdo', 'http://blog.yummygum.com/rss', 'http://rss.businessweek.com/bw_rss/nussbaumondesign', 'http://feeds.feedburner.com/iosicongallery' ]
    }, {
        'name': 'html5',
        'display_name': 'HTML5',
        'locale': 'us',
        'feeds': [ 'http://feeds.feedburner.com/SenchaBlog', 'http://feeds.webkitbits.com/WebKitBits', 'http://tjholowaychuk.com/rss', 'http://feeds.feedburner.com/thechangelog' ]            
    }, {
        'name': 'comics',
        'display_name': 'Comics',
        'locale': 'us',
        'feeds': [ 'http://xkcd.com/rss.xml', 'http://feeds.feedburner.com/oatmealfeed/', 'http://feed.dilbert.com/dilbert/daily_strip', 'http://yelpingwithcormac.tumblr.com/rss' ]    
    }, {
        'name': 'vc',
        'display_name': 'Venture Capital',
        'locale': 'us',
        'feeds': [ 
            'http://www.aaronsw.com/2002/feeds/pgessays.rss',
            'http://feeds.feedburner.com/avc',
            'http://feeds.feedburner.com/BothSidesOfTheTable',
            'http://feeds.feedburner.com/FeldThoughts',
            'http://cdixon.org/feed',
            'http://feeds.feedburner.com/forentrepreneurs',
            'http://feeds.feedburner.com/thisisgoingtobebig',
            'http://larrycheng.com/feed/',
            'http://500hats.typepad.com/500blogs/rss.xml',
            'http://feeds.feedburner.com/bhorowitz',
            'http://feeds.feedburner.com/lightspeedblog',
            'http://feeds.feedburner.com/ryanspooncom',
            'http://feeds.feedburner.com/informationarbitrage',
            'http://genuinevc.com/archives/rss.xml',
            'http://www.agilevc.com/blog/rss.xml',
            'http://feeds.feedburner.com/AskTheVC',
            'http://abovethecrowd.com/feed' 
        ]    
    }, {
        'name': 'business',
        'display_name': 'Economie',
        'locale': 'nl',
        'feeds': [
            'http://news.google.com/news?pz=1&cf=all&ned=nl_nl&hl=nl&topic=b&output=rss',
            'http://www.telegraaf.nl/rss/dft.xml',
            'http://fd.nl/?widget=rssfeed&view=feed&contentId=33810'
        ]
    }, {
        'name': 'music',
        'display_name': 'Muziek',        
        'locale': 'nl',
        'feeds': [
            'http://blog.22tracks.com/feed/',
            'http://www.nu.nl/feeds/rss/muziek.rss',
            'http://www.100p.nl/rss/',    
            'http://3voor12.vpro.nl/feeds/artikelen',
            'http://3voor12.vpro.nl/feeds/luisterpaal',
            'http://www.applysomepressure.com/site/feed',
            'http://www.festivalinfo.nl/rss/AllinfoNewsRSS.xml',
            'http://www.festivalinfo.nl/rss/FestivalinfoRecensiesRSS.xml',
            'http://alternative.blog.nl/feed',
            'http://schrik.tumblr.com/rss',
            'http://gejatteverhalen.blogspot.com/feeds/posts/default',
            'http://www.subjectivisten.nl/de_subjectivisten/rss.xml',
            'http://feeds.feedburner.com/StatemagazineFeedArticle',
            'http://www.kindamuzik.net/feeds/23456t1257.rss',
            'http://www.jobdewit.nl/?feed=rss2'    
        ]
    } , /*
{
        'name': 'fashion',
        'display_name': 'Mode',        
        'locale': 'nl',
        'feeds': [
            'http://www.fashionscene.nl/rss.php/fs_headlines/0/10',
            'http://www.trendystyle.net/blog/feed/',
            'http://www.fashionunited.nl/index2.php?option=ds-syndicate&version=1&feed_id=1',
            'http://www.modeblog.nl/feed/',
            'http://fashion.blog.nl/feed',
            'http://www.fashionmix.nl/readitems.php',
            'http://www.modefabriek.nl/feed',
        ]
    } ,
*/ {
        'name': 'sports',
        'display_name': 'Sport',        
        'locale': 'nl',
        'feeds': [
            'http://news.google.com/news?pz=1&cf=all&ned=nl_nl&hl=nl&topic=s&output=rss',
            'http://www.nu.nl/feeds/rss/sport.rss',
            'http://www.nusport.nl/feeds/rss/voorpagina.rss',
            'http://www.vi.nl/Nieuws-VI.nl.htm',
            'http://www.voetbalzone.nl/rss/rss.xml',
            'http://www.voetbalprimeur.nl/rss.php',
            'http://rss.feedsportal.com/c/585/fe.ed/www.telegraaf.nl/rss/telesport.xml',
            'http://www.ad.nl/sportwereld/rss.xml',
            'http://www.ajax.nl/web/show?id=1574057',
            'http://feeds.ajaxinside.nl/ajaxinside-rss',
            'http://feeds.fcupdate.nl/nieuws.xml',
            'http://www.psv.nl/feeds/PSVNL.xml',
            'http://www.sporteditie.nl/feeds/rss',
            'http://www.nrc.nl/nieuws/categorie/sport/rss.php',
            'http://rss.fok.nl/feeds/sport',
            'http://www.infonu.nl/rss/rss-sport.rss'                
        ]
    } , {
        'name': 'fun',
        'display_name': 'Fun',        
        'locale': 'nl',
        'feeds': [
            'http://www.dumpert.nl/rss.xml.php',
            'http://feeds.flabber.nl/flabbernl-weblog?format=xml',
            'http://feeds.flabber.nl/flabbernl-linkdump',
            'http://feeds.endandit.nl/EnDanDit',
            'http://www.kortnieuws.com/feed/',
            'http://www.vkmag.com/magazine/rss_2.0/',
            'http://www.tvoranjeshownieuws.nl/rss.php',
            'http://retecool.com/feed/',
            'http://feeds.feedburner.com/jaggle_rss',
            'http://www.skoften.net/index/feeds/frontpage/',
            'http://www.fail.nl/index/rss-video',
            'http://www.fail.nl/index/rss-picture',
            'http://www.whitelinefirm.nl/node/feed',
            'http://www.lozeshit.nl/feed',
            'http://www.afhakers.nl/rss/RSS.xml',
            'http://useloos.com/xml-rss2.php?blogid=1',
            'http://www.zuighaas.nl/feed/',
            'http://feeds.feedburner.com/geenstijl/tvnA'                
        ]
    } , {
        'name': 'entertainment',
        'display_name': 'Entertainment',        
        'locale': 'nl',
        'feeds': [
            'http://news.google.com/news?pz=1&cf=all&ned=nl_nl&hl=nl&topic=e&output=rss',
            'http://www.publiekeomroep.nl/artikelen.rss',
            'http://feeds.uitzendinggemist.nl/rss/actueel',
            'http://www.powned.tv/index.xml',
            'http://www.tvgids.nl/rss/actueel.xml',
            'http://www.uitzendinggemist.nl/weekarchief/vandaag.rss',
            'http://www.zie.nl/rss/list/329',
            'http://www.zie.nl/rss/list/432',
            'http://dewerelddraaitdoor.vara.nl/Nieuwste_fragmenten_RSS.2320.0.html'
        ]
    } , {
        'name': 'games',
        'display_name': 'Games',        
        'locale': 'nl',
        'feeds': [
            'http://www.nu.nl/feeds/rss/games.rss',
            'http://feeds.feedburner.com/gamerheadlines',
            'http://feeds.feedburner.com/gamersnet/KbfX',
            'http://rss.fok.nl/feeds/games',
            'http://www.eurogamer.nl/?format=rss',
            'http://www.insidegamer.nl/rss.xml'        
        ]
    } , {
        'name': 'cars',
        'display_name': 'Auto',        
        'locale': 'nl',
        'feeds': [
            'http://www.infonu.nl/rss/rss-auto-en-vervoer.rss',
            'http://feeds.feedburner.com/autoweek/nieuws',
            'http://autoblog.nl.feedsportal.com/c/33258/f/561170/index.rss',
            'http://www.autowereld.com/rss',
            'http://www.nu.nl/feeds/rss/auto.rss',
            'http://www.carros.nl/autonieuws/?rss'        
        ]
    }
]
