var context = { args: [], argsWithDesc: [], clDesc: '', alias: {}, displayAlias: {} }

exports.commandLine = function (proc) {
  if (process.stdin.isTTY) {
    var args = parseArgs(process.argv.slice(3))
    console.log(proc(args) || '')
  }
  else {
    process.stdin.resume()
    var data = ""

    process.stdin.on('data', function(chunk) {
      if (chunk == '') stdin.end()
      data += chunk
    })

    process.stdin.on('end', function() {
      var args = parseArgs(process.argv.slice(2))
      args['-i'] = data.trim()
      console.log(proc(args) || '')
    })
  }
}

exports.setParameters = function (param) {
  if (typeof param != 'object') {
    throw new Error('The parameters should be an object.')
  }

  context.argsWithDesc.push(param)
  context.args.push(Object.keys(param)[0])
}

exports.setAlias = function (alias) {
  var param = Object.keys(alias)[0]
  context.alias[alias[param]] = param
  context.displayAlias[param] = alias[param]
}

exports.setDescription = function (desc) {
  context.clDesc = desc;
}

function parseArgs(argv) {
  var argPairs = {}

  argv = argv.map((arg) => {
    if (context.alias[arg]) {
      return context.alias[arg]
    }
    else {
      return arg
    }
  })

  if (argv.length > 0 && argv[0] == '-h') showHelp()

  for(var i = 0; i < argv.length; i++) {
    if (context.args.indexOf(argv[i]) > -1) {
      if (i + 1 == argv.length) {
        throw new Error(`Missing value for argument "${argv[i]}".`)
      }
      argPairs[argv[i]] = argv[++i]
    }
  }
  return argPairs
}

function showHelp() {
  var aliasLen = Object.keys(context.alias).reduce((m, c) => { return Math.max(m, c.length) }, 0)
  var argLen = context.args.reduce((m, c) => { return Math.max(m, c.length) + 1}, 0)
  var options = context.argsWithDesc.map((arg, i) => {
    var key = Object.keys(arg)[0]
    var argName = `${key},${new Array(argLen + 1).join(' ')}`.slice(0, argLen)
    var aliasName = `${context.displayAlias[key] ? context.displayAlias[key] : ''}${new Array(aliasLen + 1).join(' ')}`.slice(0, aliasLen)
    return `  ${argName}${aliasName}   ${arg[key]}\n`
  })
  var help = context.clDesc.replace("{params}", `  ${options.join('').trim()}`)
  console.log(help)
  process.exit()
}

process.on('uncaughtException', (ex) => {
  console.error('\x1b[31m', `❌   ${ex.message}`)
})
