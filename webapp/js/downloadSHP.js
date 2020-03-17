let downloadCtrl={

	project:null,
	
	getDownloadTime() {
		let dt=new Date();
        dt=dt.toLocaleDateString() +'-'+ dt.toLocaleTimeString();
		dt=dt.split('/').join('-');
		return ''+dt;
	},

	getProject() {
		this.inferProjectByURI();
		return this.project;
	},

	inferProjectByURI() {
		var URL=document.location.href;
		if(URL.includes("amazon")){
			this.project="deter-amz";
		}else if(URL.includes("cerrado")){
			this.project="deter-cerrado";
		}else if(URL.includes("forest")){
			this.project="deter-fm";
		}
	},

    startDownload() {
        if(!this.project) this.inferProjectByURI();
        $('#download-shp-icon').html('<img src="img/loader.svg" />');
		this.downloadShapefile();
    },

    downloadShapefile() {

		let anchor = document.createElement("a");
		document.body.appendChild(anchor);
		let file = 'http://terrabrasilis.dpi.inpe.br/file-delivery/download/'+this.project+'/shape';
		
		let headers = new Headers();
        headers.append('Authorization', 'Bearer '+Authentication.getToken());
        
        let fileName=this.project+'-'+this.getDownloadTime()+'.zip';
		
		fetch(file, { headers })
			.then(response => response.blob())
			.then(blobby => {
				let objectUrl = window.URL.createObjectURL(blobby);
		
				anchor.href = objectUrl;
				anchor.download = fileName;
				anchor.click();
		
				window.URL.revokeObjectURL(objectUrl);
			}).finally(
				() => {
					$('#download-shp-icon').html('<i class="material-icons">save_alt</i>');
				}
			);
    }
};