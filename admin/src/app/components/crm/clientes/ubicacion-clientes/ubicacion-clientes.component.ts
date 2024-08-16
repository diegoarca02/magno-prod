import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var $:any;
import * as mapboxgl from "mapbox-gl";
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
declare var toastr:any;
declare var L: any;

@Component({
  selector: 'app-ubicacion-clientes',
  templateUrl: './ubicacion-clientes.component.html',
  styleUrls: ['./ubicacion-clientes.component.css']
})
export class UbicacionClientesComponent implements OnInit {

  public token = localStorage.getItem('token');
  public cliente: any = {
  }
  public id = '';
  public ubicaciones :Array<any> = [];
  public load_data = true;
  public load_direcciones = true;

  public data = false;
  public load_save = false;
  public load_update = false;
  public load_delete = false;
  public ubicacion : any = {
    pais: 'Mexico',
    tipo: ''
  };
  public ubicacion_edit : any = {
    pais: '',
    tipo: ''
  };
  public codes : Array<any> = [];
  public estados : Array<any> = [];

  public mapbox = (mapboxgl as typeof mapboxgl);

  public geocoder:any;
  public style = 'mapbox://styles/mapbox/streets-v11';
  public lat = 0;
  public lng = 0;
  public markerDriver :any = undefined;
  public geolocation : any = {};
  @ViewChild('asGeoCoder') asGeoCoder!: ElementRef;
  public data_geo : any = undefined;
  private mapboxChanged: boolean = false;
  public nueva_ubicacion = false;
  private mymap: any;
  private marker: any;

  constructor(
    private _clienteService:ClienteService,
    private _router:Router,
    private _route:ActivatedRoute,
    private _adminService:AdministradorService,
    private renderer2: Renderer2,
  ) {
    this.mapbox.accessToken = 'pk.eyJ1IjoiZGllZ29hcmNhMDIiLCJhIjoiY2w3d2NiejZ2MGdqMzN3b2F3Mmg3Nmt5eCJ9.FM837DnzwN2MQMVzrtnEow';
   }


  ngOnInit(): void {

    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
       
        this.init_datos();
        this.init_ubicaciones();
        this.init_codes();
      }
    );
  }

  
  init_codes(){
    this._adminService.get_Codes().subscribe(
      response=>{
        this.codes = response.countries;
        console.log(response);
        setTimeout(() => {
          $('#select-phone-create').select2({
            dropdownParent: $("#newUbicacion")
          });
         
        }, 50);
      }
    );
  }


  init_datos(){
    this.load_data = true;
    this._clienteService.get_cliente_admin(this.id,this.token).subscribe(
      response=>{
        if(response.data == undefined){
          this.data = false;
        }else{
          this.cliente = response.data;
          this.data = true;
        }
        this.load_data = false;
        
      }
    );
  }

  init_ubicaciones(){
    this.load_direcciones = true;
    this._clienteService.get_ubicaciones_clientes(this.id,'Cliente',this.token).subscribe(
      response=>{
        this.ubicaciones = response.data;
        for(var item of this.ubicaciones){
          item.hidden = true;
        }
        this.load_direcciones = false;
      }
    );
  }

  create_ubicacion(){
    this.ubicacion.prefijo = $("#select-phone-create").val();
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

    if(!this.ubicacion.prefijo){
      toastr.error("Seleccione el prefijo por favor.");
    }else if(!this.ubicacion.telefono){
      toastr.error("Ingrese el telefono por favor.");
    }else if(!this.ubicacion.tipo){
      toastr.error("Seleccione el tipo de ubicación.");
    }else{
        this.ubicacion.cliente = this.id;
        this.load_save = true;
        this._clienteService.create_ubicacion_clientes(this.ubicacion,this.token).subscribe(
          response=>{
            this.ubicacion = {};
            setTimeout(() => {
              $('#select-phone-create').select2({
                dropdownParent: $("#newUbicacion")
              }).val("").trigger("change")
            }, 50);
            toastr.success("Ubicación creada.");
            this.closeCreateUbicacion();
            this.init_ubicaciones();
            this.load_save = false;
          },
          error=>{
            toastr.error("Ocurrió un error.");
            this.load_save = false;
          }
        );
    }
  }

  get_ubicacion(id:any,idx:any){
    this.ubicaciones[idx].hidden = false;
    this._clienteService.get_ubicacion_cliente(id,this.token).subscribe(
      response=>{
        this.ubicacion_edit = response.data;
        this.lng = this.ubicacion_edit.lng;
        this.lat = this.ubicacion_edit.lat;
        console.log(this.ubicacion_edit);
        
      
        this.iniciarMapa(this.lat, this.lng);
        setTimeout(() => {
          $('#select-phone-edit-'+id).select2({
            dropdownParent: $("#editUbicacion-"+id)
          }).val(this.ubicacion_edit.prefijo).trigger("change");;
        }, 50);
      }
    );
  }

  closeUbicacion(idx:any){
    for(var item of this.ubicaciones){
      item.hidden = true;
    }
  }

  update_ubicacion(id:any){
    this.ubicacion_edit.prefijo = $("#select-phone-edit-"+id).val();
    
    if(true){
      this.ubicacion_edit.text_es = this.data_geo.text_es;
      this.ubicacion_edit.place_name_es = this.data_geo.place_name_es;
      this.ubicacion_edit.id_mapbox = this.data_geo.id;
      this.ubicacion_edit.lat = this.data_geo.center[1];
      this.ubicacion_edit.lng = this.data_geo.center[0];
    
      for(var context of this.data_geo.context){
        if (context.id.split('.')[0] === 'country') {
          this.ubicacion_edit.country = context.text_es;
        } else if (context.id.split('.')[0] === 'region') {
          this.ubicacion_edit.region = context.text_es;
        } else if (context.id.split('.')[0] === 'place') {
          this.ubicacion_edit.place = context.text_es;
        } else if (context.id.split('.')[0] === 'locality') {
          this.ubicacion_edit.locality = context.text_es;
        } else if (context.id.split('.')[0] === 'postcode') {
          this.ubicacion_edit.postcode = context.text_es;
        }
      }
    }

    if(!this.ubicacion_edit.prefijo){
      toastr.error("Seleccione el prefijo por favor.");
    }else if(!this.ubicacion_edit.telefono){
      toastr.error("Ingrese el telefono por favor.");
    }else if(!this.ubicacion_edit.tipo){
      toastr.error("Seleccione el tipo de ubicación.");
    }else{
        this.load_update = true;
        console.log(this.ubicacion_edit);
        this.ubicacion_edit.mapboxChanged = true;
        this._clienteService.update_ubicacion_cliente(id,this.ubicacion_edit,this.token).subscribe(
          response=>{
            setTimeout(() => {
              $('#select-phone-edit').select2({
                dropdownParent: $("#newUbicacion")
              }).val("").trigger("change")
            }, 50);
            toastr.success("Ubicación actualizada.");
            this.init_ubicaciones();
            this.load_update = false;
          },
          error=>{
            toastr.error("Ocurrió un error.");
            this.load_update = false;
          }
        );
    }
  }

  delete_ubicacion(id:any){
    this.load_delete = true;
    this._clienteService.delete_ubicacion_cliente(id,this.token).subscribe(
      response=>{
        $('#delete-'+id).modal('hide');
        this.init_ubicaciones();
        this.load_delete = false;
        toastr.success("Ubicación eliminada.");
      },
      error=>{
        toastr.error("Ocurrió un error.");
        this.load_delete = false;
      }
    );
  }

  
  initMap() {
    if (this.mymap) {
      this.mymap.remove();  
      delete this.mymap;    
    }
    // Solo inicializa el geocoder si no está inicializado
    this.obtenerUbicacionActual();
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
      console.log(data.features[0]);
      
      this.data_geo = data.features[0];
    });

    // Agregar el controlador de geocodificación al mapa
    L.Control.geocoder({
      defaultMarkGeocode: false, // Evitar que se agregue un marcador por defecto al geocodificar
    }).on('markgeocode', async (event: any) => {
      try {
        const { center } = event.geocode;
        this.marker.setLatLng(center).update();
        this.mymap.panTo(center);
    
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${center.lng},${center.lat}.json?access_token=${this.mapbox.accessToken}&language=es`);
        
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.statusText}`);
        }
    
        const data = await response.json();
        this.data_geo = data.features[0];
      } catch (error) {
        console.error('Ocurrió un error durante la solicitud geocodificada:', error);
        // Manejar el error, por ejemplo, mostrando un mensaje al usuario
      }
    }).addTo(this.mymap);

    console.log(this.data_geo);
    
  }

  openCreateUbicacion(){
    this.nueva_ubicacion = true;
    setTimeout(() => {
      $('#select-phone-create')
      .select2().val(this.ubicacion_edit.prefijo).trigger("change");;
    }, 50);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((response)=>{
        this.lng = response.coords.longitude;
        this.lat = response.coords.latitude;
        this.initMap();
      });
    } else { 
      alert("Geolocation is not supported by this browser.");
    }
   
  }

  closeCreateUbicacion(){
    this.nueva_ubicacion = false;
  }
}
