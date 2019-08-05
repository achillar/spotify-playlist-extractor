/*
    The MIT License (MIT)

    Copyright (c) 2013 Julian Xhokaxhiu

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
jQuery(function ($) {
    var userPlaylist = [];

    function getPlaylistCoverImage(playlistView$) {
        const playlistCoverImage = playlistView$.find('div.cover-art-image').css('background-image');
        if (!playlistCoverImage) {
            console.error('Could not find the playlist cover image.');
            alert('No playlistCoverImage');
        }

        return playlistCoverImage;
    }

    function getPlaylistTitle(playlistView$) {
        const playlistTitle = playlistView$.find('div.mo-info-name').attr('title');
        if (!playlistTitle) {
            console.error('Could not find the play list title image.');
        }

        return playlistTitle;
    }

    function getPlaylistTitle(playlistView$) {
        const playlistTitle = playlistView$.find('div.mo-info-name').attr('title');
        if (!playlistTitle) {
            console.error('Could not find the play list title image.');
        }

        return playlistTitle;
    }

    var getItems = function () {

        let tracks = [];
        const metas = document.querySelectorAll('head meta[property="music:song"], head meta[property="music:song:track"]');
        if (metas.length % 2 !== 0) {
            console.error("Number of matching meta elements is odd: " + metas.length);
            // return;
        }
        metas.forEach((elem, ix, list) => {
            const contentVal = elem.getAttribute('content');
            if (ix % 2 === 0) {
                currentTrackUrl = contentVal;
            } else {
                tracks[contentVal - 1] = currentTrackUrl;
            }
        });

        const scrollTime = 5;
        const playlistView$ = $('div.PlaylistContainer'); // .contents().find('#pf-playlist-view');
        if (!playlistView$) {
            console.error('Could not find the playlistView element.');
            alert('No Playlist');
        }
        const coverImage = getPlaylistCoverImage(playlistView$);
        const playlistTitle = getPlaylistTitle(playlistView$);

        // Get Items
        const trackList$ = playlistView$.find('ol.tracklist');
        const playlistItems = trackList$
            .find('.tracklist-row')
            .each((i, item) => {
                item = $(item);
                userPlaylist.push({
                    'trackURI': tracks[i],
                    'title': item.find('.tracklist-name').text(),
                    'artistURI': item.find('.tracklist-row__artist-name-link').data('uri'),
                    'artist': item.find('.tracklist-row__artist-name-link').text(),
                    'albumURI': item.find('.tracklist-row__album-name-link').data('uri'),
                    'album': item.find('.tracklist-row__album-name-link').text(),
                });
            });
        GLOBAL.info('Got ' + playlistItems.length + ' items. Continue to scrap in ' + scrollTime + ' seconds...');

        const lastItem = playlistItems
            .filter(function (i) {
                $this = $(this);
                return ($this.find('.tl-name .tl-highlight').length == 0);
            }).first().prev();

        if (lastItem.length) {
            $('html, body').animate({
                scrollTop: $(document).height()
            }, 'fast');

            // // Calculate TOP offset
            // const header = playlistView$.find('header.header');
            // const rowListHeaders = playlistView$.find('thead.tl-header');
            // playlistView$.scrollTop(header.outerHeight() + rowListHeaders.outerHeight() + (lastItem.outerHeight() * parseInt(lastItem.data('index'))));

            // setTimeout(getItems, scrollTime * 1000);
        } else {
            GLOBAL.info('Done! Got ' + Object.keys(userPlaylist).length + ' items.', userPlaylist);
            chrome.extension.sendMessage({
                'items': userPlaylist
            });
        }
    }
    chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
        GLOBAL.debug('foreground onMessage CALLED!');
        userPlaylist = [];
        if (request == 'getItems') getItems();
    });
})