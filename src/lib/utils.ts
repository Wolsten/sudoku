
export let shortcuts = new Map

export let registerCommand = function (label: string, command: string): { pre: string, shortcut: string, post: string } {

    // console.log('label', label);
    const match = [...label.matchAll(/(.*)_(.)_(.*)/g)];
    // console.log('match', match)

    let result = {
        pre: '',
        shortcut: 'UNKNOWN',
        post: ''
    }

    if (match !== null && match[0].length === 4) {
        result = {
            pre: match[0][1],
            shortcut: match[0][2],
            post: match[0][3]
        }

        if (shortcuts.has(result.shortcut) === false) {
            shortcuts.set(result.shortcut, command)
        }
    }

    // console.log('formatted label', result);
    return result
}



export let registerKey = function (key: string) {
    if (shortcuts.has(key) === false) {
        shortcuts.set(key, key)
    }
}