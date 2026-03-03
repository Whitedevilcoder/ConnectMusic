const cleanTrackData = (youtubeTitle, channelName) => {
    // 1. Remove junk
    let cleanTitle = youtubeTitle
        .replace(/\(Official Video\)/gi, "")
        .replace(/\(Official Audio\)/gi, "")
        .replace(/\(Lyrics\)/gi, "")
        .replace(/\(HD\)/gi, "")
        .replace(/\[4K\]/gi, "")
        .replace(/ft\./gi, "")
        .trim();

    // 2. Split Artist - Track
    const separator = cleanTitle.includes(" - ") ? " - " : cleanTitle.includes(" : ") ? " : " : null;
    let artist = "";
    let track = "";

    if (separator) {
        const parts = cleanTitle.split(separator);
        artist = parts[0].trim();
        track = parts[1].trim();
    } else {
        // Fallback: Use channel name as artist
        artist = channelName.replace("VEVO", "").trim(); 
        track = cleanTitle;
    }

    return { artist, track };
};

export default cleanTrackData;