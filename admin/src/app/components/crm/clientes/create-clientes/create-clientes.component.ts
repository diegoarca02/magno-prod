import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var $:any;
import * as mapboxgl from "mapbox-gl";
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
declare var toastr:any;
declare var L: any;
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
declare var Cleave:any;

@Component({
  selector: 'app-create-clientes',
  templateUrl: './create-clientes.component.html',
  styleUrls: ['./create-clientes.component.css']
})
export class CreateClientesComponent implements OnInit {

  public token = localStorage.getItem('token');
  public cliente: any = {
    tipo_empresa: ''
  };
  public ubicacion: any = {
    tipo: ''
  };
  public data_geo: any = undefined;
  public codes : Array<any> = [];
  public estado_ubicacion = true;
  public estado_empresa = false;

  public estados : Array<any> = [];
  public load_btn = false;

  public lat = 0;
  public lng = 0;


  private mymap: any;
  private marker: any;
  public mapbox = (mapboxgl as typeof mapboxgl);
  public option = 1;
  public permisos : Array<any> = [];

  constructor(
    private _clienteService:ClienteService,
    private _adminService:AdministradorService,
    private _router:Router,
    private renderer2: Renderer2
  ) {
    this.mapbox.accessToken = 'pk.eyJ1IjoiZGllZ29hcmNhMDIiLCJhIjoiY2w3d2NiejZ2MGdqMzN3b2F3Mmg3Nmt5eCJ9.FM837DnzwN2MQMVzrtnEow';
  }

  ngOnInit(): void {
    
  }

  handlePermisos(event:any){
    this.permisos = event;
    if(this.permisos.includes('2001')){
      this.init_codes();

      setTimeout(() => {
        new Cleave('#inpTelefono', {
            numericOnly: true,
            blocks: [2, 4, 4],
            delimiter: ' ',
            delimiterLazyShow: true
        });
      }, 50);
    }else{
      this._router.navigate(['/dashboard']);
    }
  }

  obtenerUbicacionActual(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;

        this.iniciarMapa(this.lat, this.lng);
      }, (error) => {
        console.error('Error obteniendo la ubicación: ', error);
      });
    } else {
      console.error('Geolocalización no soportada en este navegador.');
    }
  }

  iniciarMapa(lat: number, lon: number): void {
    this.mymap = L.map('mapid').setView([lat, lon], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mymap);

    // Agregar un marcador con popup y hacerlo arrastrable
    this.marker = L.marker([lat, lon], { draggable: true }).addTo(this.mymap);
    this.marker.bindPopup("<b>Tu ubicación actual</b>").openPopup();

    // Configurar evento para el arrastre del marcador
    this.marker.on('dragend', async (event:any) => {
      const marker = event.target;
      const position = marker.getLatLng();

      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${position.lng},${position.lat}.json?access_token=${this.mapbox.accessToken}&language=es`);
      const data = await response.json();
      this.data_geo = data.features[0];
      
    });

     // Agregar el controlador de geocodificación al mapa
      L.Control.geocoder({
        defaultMarkGeocode: false, // Evitar que se agregue un marcador por defecto al geocodificar
      }).on('markgeocode', async (event: any) => {
        const { center } = event.geocode;
        this.marker.setLatLng(center).update();
        this.mymap.panTo(center);

        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${center.lng},${center.lat}.json?access_token=${this.mapbox.accessToken}&language=es`);
        const data = await response.json();
        this.data_geo = data.features[0];

      }).addTo(this.mymap);
  }
  



  init_codes(){
    this._adminService.get_Codes().subscribe(
      response=>{
        this.codes = response.countries;
        console.log(this.codes);
        
        setTimeout(() => {
          $("#select-phone-create").select2().val("+52").trigger("change");
        }, 50);
      }
    );
  }

  set_empresa(value:any){
    this.estado_empresa = value;
  }

  copy_telefono(){
    this.ubicacion.telefono = this.cliente.telefono;
    this.cliente.prefijo = $("#select-phone-create").val();
    this.ubicacion.prefijo = this.cliente.prefijo;
    setTimeout(() => {
      $('#select-phone-direccion').select2().val(this.ubicacion.prefijo).trigger("change");;
    }, 50);
  }

  registrar(){
    console.log(this.data_geo);
    this.cliente.estado_empresa = this.estado_empresa;
    this.cliente.prefijo = $("#select-phone-create").val();
    this.ubicacion.prefijo = $("#select-phone-direccion").val();

    this.ubicacion.text_es = this.data_geo.text_es;
    this.ubicacion.place_name_es = this.data_geo.place_name_es;
    this.ubicacion.id_mapbox = this.data_geo.id;
    this.ubicacion.lat = this.data_geo.center[1];
    this.ubicacion.lng = this.data_geo.center[0];

    for(var context of this.data_geo.context){
      if (context.id.split('.')[0] === 'country') {
        this.ubicacion.country = context.text_es;
      } else if (context.id.split('.')[0] === 'region') {
        this.ubicacion.region = context.text_es;
      } else if (context.id.split('.')[0] === 'place') {
        this.ubicacion.place = context.text_es;
      } else if (context.id.split('.')[0] === 'locality') {
        this.ubicacion.locality = context.text_es;
      } else if (context.id.split('.')[0] === 'postcode') {
        this.ubicacion.postcode = context.text_es;
      }
    }

    if(!this.cliente.nombres){
      toastr.error("Ingrese los nombres por favor.");
    }else if(!this.cliente.apellidos){
      toastr.error("Ingrese los apellidos por favor.");
    }else if(!this.cliente.email){
      toastr.error("Ingrese el email por favor.");
    }else if(!this.cliente.prefijo){
      toastr.error("Seleccione el prefijo por favor.");
    }else if(!this.cliente.telefono){
      toastr.error("Ingrese el telefono por favor.");
    }else{
      if(this.estado_ubicacion){
        this.ubicacion.pais = $("#kt_docs_select2_country").val();
        if(!this.ubicacion.telefono){
          toastr.error("Ingrese el telefono por favor.");
        }else if(!this.ubicacion.tipo){
          toastr.error("Seleccione el tipo de ubicación.");
        }else{
          this.cliente.ubicacion = this.ubicacion;
          this.registro_api(); 
        }
      }else{
        this.registro_api(); 
      }
    }
  }

  registro_api(){
    this.load_btn = true;
    this._clienteService.create_cliente(this.cliente,this.token).subscribe(
      response=>{
        console.log(response);
        if(response.data != undefined){
          toastr.success("Creación completada.");
          this._router.navigate(['/clientes']);
        }else{
          toastr.error(response.message);
        }
        this.load_btn = false;
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_btn = false;
      }
    );
  }


  setOption(value:any) {
    this.option = value;
    if(value == 1){
      setTimeout(() => {
        $("#select-phone").select2().val("+52").trigger("change");
      }, 50);
    }else if(value == 2){
      this.obtenerUbicacionActual();
      setTimeout(() => {
        $('#select-phone2').select2().val(this.ubicacion.prefijo).trigger("change");
      }, 50);
    }
    
  }
}
