var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var fuse = require('fuse.js');
const { text } = require('body-parser');
var web_news="https://m.mangabat.com/"


// Config
var port = process.env.PORT | 8888;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route
app.get('/api/manga/home', home);
app.get('/api/manga/latest_update', latest_update);
app.get('/api/manga/search', search);
app.get('/api/manga/detail', detail);
app.get("/api/manga/read",read)






function home(req,res){
	request(web_news,(error,response,html)=>{
		if(!error){
			var popular=[];
			var latest_updaye=[];
			var $ = cheerio.load(html);

			$("#owl-slider").find(".item").each((i,el)=>{
				//console.log($(el).children());
				var url=$(el).find("a").attr("href");
				var judul_manga=$(el).find("a").attr("title");
				var chapter_terakhir=$(el).find(".slide-caption").find("a").last().attr("title")
				var alamat_gambar=$(el).find("img").attr("src")
				popular.push({
					url:url,
					judul_manga:judul_manga,
					chapter_terakhir:chapter_terakhir,
					alamat_gambar:alamat_gambar,
				})
			})

			
			$(".content-homepage-item").each((i,el)=>{
				var url=$(el).children("a").attr("href");
				var judul_manga=$(el).children("a").attr("title");
				var chapter_terakhir=$(el).find(".a-h.item-chapter").first().find("a").text()
				var alamat_gambar=$(el).children("a").children("img").attr("src")

				latest_updaye.push({
					url:url,
					judul_manga:judul_manga,
					chapter_terakhir:chapter_terakhir,
					alamat_gambar:alamat_gambar,
				})
				
			})

			

			res.status(200).json({
				status:"1",
				message:"Welcome to manga home API",
				data:{
					popular:popular,
					latest_update:latest_updaye
				}
			});

		}else{
			res.status(500).json({
				status: "0",
				error:error,
				message: 'Something wrong with manga API ',
		   });
		}
	});
}


function latest_update(req,res){
	var page="";
	if(req.query.page!=null){
		page=req.query.page
	}
	request(web_news+"/manga-list-all/"+page,(error,response,html)=>{
		if(!error){
			var latest_updaye=[];
			var $ = cheerio.load(html);


			$(".list-story-item").each((i,el)=>{
				var url=$(el).children("a").attr("href");
				var judul_manga=$(el).children("a").attr("title");
				var alamat_gambar=$(el).children("a").children("img").attr("src")
				var chapter_terakhir=$(el).find(".item-chapter.a-h").first().text()
				var sinopsis=$(el).find(".text-nowrap.item-author").text()


				latest_updaye.push({
					url:url,
					judul_manga:judul_manga,
					chapter_terakhir:chapter_terakhir,
					alamat_gambar:alamat_gambar,
					sinopsis:sinopsis
				})
				
			})

			

			res.status(200).json({
				status:"1",
				message:"Welcome to manga latest updaye API",
				data:{
					latest_update:latest_updaye,
					total:latest_updaye.length
				}
			});

		}else{
			res.status(500).json({
				status: "0",
				error:error,
				message: 'Something wrong with manga API ',
		   });
		}
	});
}



function search(req,res){
	var page="";
	if(req.query.keyword==null){
		res.status(500).json({
			status: "0",
			message: 'You must add parameter ',
	   });
		
	}
	if(req.query.page!=null){
		page="?page="+req.query.page
	}
	request(web_news+"search/"+req.query.keyword+page,(error,response,html)=>{
		if(!error){
			var latest_updaye=[];
			var $ = cheerio.load(html);


			
			$(".list-story-item").each((i,el)=>{
				var url=$(el).children("a").attr("href");
				var judul_manga=$(el).children("a").attr("title");
				var alamat_gambar=$(el).children("a").children("img").attr("src")
				var chapter_terakhir=$(el).find(".item-chapter.a-h").first().text()
				var sinopsis=$(el).find(".text-nowrap.item-author").text()


				latest_updaye.push({
					url:url,
					judul_manga:judul_manga,
					chapter_terakhir:chapter_terakhir,
					alamat_gambar:alamat_gambar,
					sinopsis:sinopsis
				})
				
			})

			

			res.status(200).json({
				status:"1",
				message:"Welcome to manga latest updaye API",
				data:{
					result:latest_updaye,
					total:latest_updaye.length
				}
			});

		}else{
			res.status(500).json({
				status: "0",
				error:error,
				message: 'Something wrong with manga API ',
		   });
		}
	});
}


function detail(req,res){
	if(req.query.url==null){
		res.status(500).json({
			status: "0",
			message: 'You must add parameter ',
	   });
		
	}

	request(req.query.url,(error,response,html)=>{
		if(!error){
			var latest_updaye=[];
			var $ = cheerio.load(html);
			var judul_manga="";
			var author="";
			var status="";
			var genre=[];
			var sinopsis=""
			var alamat_gambar=""
			var chapters=[];
			var terakhir_update="";
			var dilihat="";
			var data2=[];
			$(".row-content-chapter").children(".a-h").each((i,el)=>{
				chapters.push({
					url:$(el).find("a").attr("href"),
					chapter:$(el).find("a").attr("title").split(":")[0],
					judul:$(el).find("a").attr("title").split(":")[1],
					tanggal:$(el).find(".chapter-time").text(),
				})
			})


			 var data=[];
			$(".story-info-right").find(".table-value").each((i,el)=>{
			    if($(el).find("h1").text()!=""){
					data.push($(el).find("h1").text())
				}else{
					data.push($(el).text())
				}
			})

			$(".story-info-right-extent").find(".stre-value").each((i,el)=>{
			    if($(el).find("h1").text()!=""){
					data2.push($(el).find("h1").text())
				}else{
					data2.push($(el).text())
				}
			})

			var alamat_gambar=$(".info-image").find("img").attr("src")
			judul_manga=$(".story-info-right").find("h1").text();
			sinopsis=$(".panel-story-info-description").text().replace(/\n/g, '')

			

			// if(data.length>0){
			// 	judul_manga=data[0];
			 	author=data[1].replace( /\s\s+/g, ' ' )
				status=data[2];
			// 	terakhir_update=data[3].split(":")[1]
			// 	dilihat=data[5].split(":")[1]
				genre=data[3].split("-");
				for(var i=0;i<genre.length;i++){
					genre[i]=genre[i].replace(/\n/g, '');
				}

			// }


			res.status(200).json({
				status:"1",
				message:"Welcome to manga latest updaye API",
				data:{
				   judul_manga:judul_manga,
				   author:author.replace(/\n/g, ''),
				   status:status.replace( /\s\s+/g, ' ' ),
				   genre:genre,
				   sinopsis:sinopsis.replace( /\s\s+/g, ' ' ),
				   alamat_gambar:alamat_gambar,
				   chapters:chapters,
				   terakhir_update:data2[0],
				   dilihat:data2[1]
				}
			});

		}else{
			res.status(500).json({
				status: "0",
				error:error,
				message: 'Something wrong with manga API ',
		   });
		}
	});
}

function read(req,res){
	if(req.query.url==null){
		res.status(500).json({
			status: "0",
			message: 'You must add parameter ',
	   });
		
	}

	
	request(req.query.url,(error,response,html)=>{
		if(!error){
			var $ = cheerio.load(html);
			var gambar=[];

			$(".container-chapter-reader").find("img").each((i,el)=>{
				gambar.push($(el).attr("src"));
				// console.log($(el).text());
			})
		
			res.status(200).json({
				status:"1",
				message:"Welcome to manga latest updaye API",
				data:{
					gambar:gambar,
					total:gambar.length
				}
			});

		}else{
			res.status(500).json({
				status: "0",
				error:error,
				message: 'Something wrong with manga API ',
		   });
		}
	});
}




//



// Run
console.log('App Started');
app.listen(port);