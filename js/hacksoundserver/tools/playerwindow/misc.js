var PADDING = 6;

function soundEventToTooltipText(metadata, soundEvent) {
    let text = '';

    for (const prop of metadata.properties) {
        let value = soundEvent.getValueByProp(prop);
        if (!value)
            continue;

        let line = '';
        if (prop === 'sound-files') {
            for (const path of value) {
                line += `<b>${prop}</b>: ${path}\n`;
            }
        } else {
            line = `<b>${prop}</b>: ${value}\n`;
        }
        text += line;
    }
    return text;
}
