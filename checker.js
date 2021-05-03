const request = require('request');
const chalk = require('chalk');
const prompt = require('prompt');
const fs = require('fs');
const proxies = fs.readFileSync('proxies.txt', 'utf-8').replace(/\r/gi, '').split('\n');
const usernames = [...new Set(require('fs').readFileSync('usernames.txt', 'utf-8').replace(/\r/g, '').split('\n'))];
const ProxyAgent = require('proxy-agent');
const cheerio = require('cheerio');
const dateFormat = require('dateformat');

process.on('uncaughtException', e => {});
process.on('uncaughtRejection', e => {});
process.on('UnhandledPromiseRejectionWarning', e => {});
process.warn = () => {};
console.warn = function() {};

var available = 0;
var unavailable = 0;
var rate = 0;
var checked = 0;

function write(content, file) {
    fs.appendFile(file, content, function(err) {
    });
}




function getAgent(username, type , proxy){
	try{
	var agent = new ProxyAgent(`${type}://` + proxy);
	return agent; 
	}catch{
		function intervalFunc() {
			pcheck(username)
		setInterval(intervalFunc, 10);
		}
	}
}


function check(username,type) {
    var proxy = proxies[Math.floor(Math.random() * proxies.length)];
	let agent = getAgent(username, type , proxy);
	
    request({
        method: "GET",
        url: `https://api.mojang.com/users/profiles/minecraft/${username}`,
		agent,
        'timeout': 2500,
        json: true,
    }, (err, res, body) => {
        if (res && res.statusCode === 200) {
            unavailable++;
            console.log(chalk.red("[%s] (%s/%s/%s) [Not Available] Username: %s | Proxy: %s"), res.statusCode, available, checked, usernames.length, username, proxy);
            write(username + "\n", "usernames/mojang_unavailable.txt");
		}
		else if (res && res.statusCode === 204) {
			available++;
			console.log(chalk.green(`[%s] (%s/%s/%s) [Available] Username: %s | Proxy: %s`), res.statusCode, available, checked, usernames.length, username, proxy);
			write(username + "\n", "usernames/mojang_available.txt");

        } else if (res && res.statusCode === 429) {
            rate++;
            console.log(chalk.red("[%s] (%s) Proxy: %s has been rate limited".inverse), res.statusCode, rate, proxy);
            check(username);
		}
		else{
			check(username);
		}

        checked = available + unavailable;
        process.title = `[Minecraft Usernames Checker] - ${checked}/${usernames.length} Total Checked | ${available} Available | ${unavailable} Unavailable | ${rate} Rate Limited`;
    });
}

function getAvailabilityTime(data) {

  const $ = cheerio.load(data);
  const timeSelector = 'time#availability-time';

  if($(timeSelector).length) {
    return `available at ${dateFormat($(timeSelector).attr('datetime'), 'mm/dd/yyyy')}`;
  } else {
	if (data.indexOf('Unavailable') > -1) {
		
		return `unavailable`; 
	} else {
		
		return 'available now';
	}
    
  }

}

function Availability(username,type) {

var proxy = proxies[Math.floor(Math.random() * proxies.length)];
let agent = getAgent(username, type , proxy);
  request({
      method: "GET",
      url: `https://namemc.com/name/${username}`,
	  agent,
	  'timeout': 2500,
	  headers: { 
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36',	  
	  }
	}, (err, res, body) => {
    if (res && res.statusCode === 200) {
		var data = body;
		var AvailabilityTime = getAvailabilityTime(data); 
			if(AvailabilityTime === "unavailable"){ 
				unavailable++;
				console.log(chalk.red("[%s] (%s/%s/%s) [Not Available] Username: %s | Proxy: %s"), res.statusCode, available, checked, usernames.length, username, proxy);
				write(username + "\n", "usernames/namemc_unavailable.txt");
			}
			else{
				available++;
				console.log(chalk.green(`[%s] (%s/%s/%s) [Available] Username: %s |  Availability: ${AvailabilityTime}  | Proxy: %s`), res.statusCode, available, checked, usernames.length, username, proxy);
				write(username + ` | Availability: ${AvailabilityTime}` + "\n", "usernames/namemc_available.txt");
			}
	}
	else{
		Availability(username);
	}
		checked = available + unavailable;
		process.title = `[313][Minecraft Usernames Checker] - ${checked}/${usernames.length} Total Checked | ${available} Available | ${unavailable} Unavailable | ${rate} Rate Limited`;
	}) 
}




//Program Startup
function printAsciiLogo() {
  console.log(`
				• ▌ ▄ ·.  ▄▄·  ▄▄·  ▄ .▄▄▄▄ . ▄▄· ▄ •▄ ▄▄▄ .▄▄▄    ${chalk.green(" ▐▄▄▄.▄▄ ·  ")}
				·██ ▐███▪▐█ ▌▪▐█ ▌▪██▪▐█▀▄.▀·▐█ ▌▪█▌▄▌▪▀▄.▀·▀▄ █·  ${chalk.green("  ·██▐█ ▀.  ")}
				▐█ ▌▐▌▐█·██ ▄▄██ ▄▄██▀▐█▐▀▀▪▄██ ▄▄▐▀▀▄·▐▀▀▪▄▐▀▀▄   ${chalk.green("▪▄ ██▄▀▀▀█▄ ")}
				██ ██▌▐█▌▐███▌▐███▌██▌▐▀▐█▄▄▌▐███▌▐█.█▌▐█▄▄▌▐█•█▌  ${chalk.green("▐▌▐█▌▐█▄▪▐█ ")}
				▀▀  █▪▀▀▀·▀▀▀ ·▀▀▀ ▀▀▀ · ▀▀▀ ·▀▀▀ ·▀  ▀ ▀▀▀ .▀  ▀  ${chalk.green(" ▀▀▀• ▀▀▀▀  ")}      
							[Coded By Luci]
																								
  `);
}
printAsciiLogo();
process.title = `[313][Minecraft Usernames Checker] Created By Luci`;
console.log(chalk.inverse("[1] Mojang API Checker (Proxies) [No Date]"));
console.log(chalk.inverse("[2] NameMC Checker (Proxies)"));
prompt.start();	
	console.log(""); 
	prompt.get(['options'], function(err, result) {
	console.log('');
	var options = result.options;
		switch(options) {
		case "1":
		console.log(chalk.inverse("[INFO] Press Corrosponding Number to Select Proxy Type! ")); 
			console.log(`[1] https
[2] socks4
[3] socks5`); 
			prompt.get(['type'], function(err, result) {
			console.log('');
			var type = result.type;
			switch(type) {
				case "1": 
					var type = "http";
					break
				case "2":
					var type = "socks4";
					break
				case "3":
					var type = "socks5";
					break
				default:
					var type = "http";
					break
			}
			console.log(chalk.inverse(`[Minecraft Username Checker]: Started!`));
			console.log(chalk.inverse(`[Checking ${usernames.length} Usernames with ${proxies.length} Proxies!]`));
			for (var i in usernames) check(usernames[i],type);
			})
			break;
			
		case "2":
		console.log(chalk.inverse("[INFO] Press Corrosponding Number to Select Proxy Type! ")); 
			console.log(`[1] https
[2] socks4
[3] socks5`); 
			prompt.get(['type'], function(err, result) {
			console.log('');
			var type = result.type;
			switch(type) {
				case "1": 
					var type = "http";
					break
				case "2":
					var type = "socks4";
					break
				case "3":
					var type = "socks5";
					break
				default:
					var type = "http";
					break
			}
			for (var i in usernames) Availability(usernames[i],type);
			})
			break;
		}
			
		
	})
	
