const { argv } = require('process')
const { spawn } = require('node:child_process')
const { Writable } = require('node:stream')


class OperatingSystem {
    static isWin = (process.platform === "win32")
    static isLinux = (process.platform === "linux")
    static isMac = (process.platform === "darwin")
    static isSupported = this.isWin || this.isLinux || this.isMac

    static npmCmd = OperatingSystem.isWin ? 'npm.cmd' : 'npm'
}


if (OperatingSystem.isSupported) {
    switch (argv[2]) {
        case 'bot': {
            const cmd = spawn(OperatingSystem.npmCmd, ['run', argv[3], '--color=always'], { stdio: 'pipe', windowsHide: true })
            cmd.stdout.pipe(process.stdout);
            cmd.stderr.pipe(process.stderr);
            break;
        }
        case 'lavalink': {
            const cmd = spawn(OperatingSystem.npmCmd, ['run', 'lavalink', '--color=always'], { stdio: 'pipe', windowsHide: true })
            cmd.stdout.pipe(process.stdout);
            cmd.stderr.pipe(process.stderr);
            break;
        }
        default: break;
    }
} else {
    console.error(`The current operating system ${process.platform} is not supported!`)
}

