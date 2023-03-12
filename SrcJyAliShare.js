function aliShare() {
    let share_id = rurl.split('&sl=')[1].split('&')[0];
    let file_id = rurl.split('&f=')[1].split('&')[0];
    let alitoken = alistconfig.alitoken;
    let play = getAliUrl(share_id, file_id, alitoken);
    if (play.urls) {
        if (subtitle) {
            play['subtitle'] = subtitle;
        }
        return JSON.stringify(play);
    }
}