import { NgModule,LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { routing } from './app.routing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, CurrencyPipe} from '@angular/common';
import {NgbPaginationModule, NgbAlertModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';

import localeEs from "@angular/common/locales/es";
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeEs,'es');
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { IndexColaboradoresComponent } from './components/colaboradores/index-colaboradores/index-colaboradores.component';
import { CreateColaboradoresComponent } from './components/colaboradores/create-colaboradores/create-colaboradores.component';
import { EditColaboradoresComponent } from './components/colaboradores/edit-colaboradores/edit-colaboradores.component';
import { LoginComponent } from './components/login/login.component';
import { IndexClientesComponent } from './components/crm/clientes/index-clientes/index-clientes.component';
import { CreateClientesComponent } from './components/crm/clientes/create-clientes/create-clientes.component';
import { EditClientesComponent } from './components/crm/clientes/edit-clientes/edit-clientes.component';
import { VerificationClienteComponent } from './components/crm/clientes/verification-cliente/verification-cliente.component';
import { UbicacionClientesComponent } from './components/crm/clientes/ubicacion-clientes/ubicacion-clientes.component';
import { IndexEmpresasComponent } from './components/crm/empresas/index-empresas/index-empresas.component';
import { RsEmpresasComponent } from './components/crm/empresas/rs-empresas/rs-empresas.component';
import { IndexRolesComponent } from './components/roles/index-roles/index-roles.component';
import { CreateRolesComponent } from './components/roles/create-roles/create-roles.component';
import { EditRolesComponent } from './components/roles/edit-roles/edit-roles.component';
import { DetailRolesComponent } from './components/roles/detail-roles/detail-roles.component';
import { CreateProductoComponent } from './components/productos/create-producto/create-producto.component';
import { IndexProductoComponent } from './components/productos/index-producto/index-producto.component';
import { EditProductoComponent } from './components/productos/edit-producto/edit-producto.component';
import { GaleriaProductoComponent } from './components/productos/galeria-producto/galeria-producto.component';
import { IndexIngresoComponent } from './components/ingreso/index-ingreso/index-ingreso.component';
import { CreateIngresoComponent } from './components/ingreso/create-ingreso/create-ingreso.component';
import { IndexProveedorComponent } from './components/proveedor/index-proveedor/index-proveedor.component';
import { CreateProveedorComponent } from './components/proveedor/create-proveedor/create-proveedor.component';
import { EditProveedorComponent } from './components/proveedor/edit-proveedor/edit-proveedor.component';
import { IndexPedidoComponent } from './components/pedido/index-pedido/index-pedido.component';
import { CreatePedidoComponent } from './components/pedido/create-pedido/create-pedido.component';
import { DetallePedidoComponent } from './components/pedido/detalle-pedido/detalle-pedido.component';
import { PedidoDetalleComponent } from './components/publico/pedido-detalle/pedido-detalle.component';
import { EnvioPedidoComponent } from './components/pedido/envio-pedido/envio-pedido.component';
import { DetalleIngresoComponent } from './components/ingreso/detalle-ingreso/detalle-ingreso.component';
import { SettingsComponent } from './components/settings/settings.component';
import { IndexInventarioComponent } from './components/inventario/index-inventario/index-inventario.component';
import { DetailInventarioComponent } from './components/inventario/detail-inventario/detail-inventario.component';
import { IndexVentaComponent } from './components/venta/index-venta/index-venta.component';
import { CreateVentaComponent } from './components/venta/create-venta/create-venta.component';
import { DetalleVentaComponent } from './components/venta/detalle-venta/detalle-venta.component';
import { IndexOrdenComponent } from './components/orden/index-orden/index-orden.component';
import { DetalleOrdenComponent } from './components/orden/detalle-orden/detalle-orden.component';
import { IndexProgramacionComponent } from './components/programacion/index-programacion/index-programacion.component';
import { CreateProgramacionComponent } from './components/programacion/create-programacion/create-programacion.component';
import { IndexCobranzaComponent } from './components/cobranza/index-cobranza/index-cobranza.component';
import { CreateCobranzaComponent } from './components/cobranza/create-cobranza/create-cobranza.component';
import { CreaditoCobranzaComponent } from './components/cobranza/creadito-cobranza/creadito-cobranza.component';
import { DetalleProgramacionOrdenComponent } from './components/orden/detalle-programacion-orden/detalle-programacion-orden.component';
import { DetallePagoComponent } from './components/cobranza/detalle-pago/detalle-pago.component';
import { CobranzaKpiComponent } from './components/kpis/cobranza/cobranza-kpi/cobranza-kpi.component';
import { CobranzaClientesComponent } from './components/crm/clientes/cobranza-clientes/cobranza-clientes.component';
import { PagosMesClientesComponent } from './components/crm/clientes/pagos-mes-clientes/pagos-mes-clientes.component';
import { SidebarCobranzaKpiComponent } from './components/kpis/cobranza/sidebar-cobranza-kpi/sidebar-cobranza-kpi.component';
import { MillionCobranzaKpiComponent } from './components/kpis/cobranza/million-cobranza-kpi/million-cobranza-kpi.component';
import { ProductosCobranzaKpiComponent } from './components/kpis/cobranza/productos-cobranza-kpi/productos-cobranza-kpi.component';
import { SidebarVentasKpiComponent } from './components/kpis/ventas/sidebar-ventas-kpi/sidebar-ventas-kpi.component';
import { ProductosVentasKpiComponent } from './components/kpis/ventas/productos-ventas-kpi/productos-ventas-kpi.component';
import { ManualIngresoComponent } from './components/ingreso/manual-ingreso/manual-ingreso.component';
import { AsesorCobranzaKpiComponent } from './components/kpis/cobranza/asesor-cobranza-kpi/asesor-cobranza-kpi.component';
import { AsesorVentasKpiComponent } from './components/kpis/ventas/asesor-ventas-kpi/asesor-ventas-kpi.component';
import { MiCuentaComponent } from './components/mi-cuenta/mi-cuenta.component';
import { DetalleCobranzaComponent } from './components/cobranza/detalle-cobranza/detalle-cobranza.component';
import { HistorialInventarioComponent } from './components/inventario/historial-inventario/historial-inventario.component';
import { SolicitudesCobranzaComponent } from './components/cobranza/solicitudes-cobranza/solicitudes-cobranza.component';
import { IndexDeudaComponent } from './components/deudas/index-deuda/index-deuda.component';
import { GeneralInventarioComponent } from './components/inventario/general-inventario/general-inventario.component';
import { IndexCuponesComponent } from './components/cupones/index-cupones/index-cupones.component';
import { CreateCuponesComponent } from './components/cupones/create-cupones/create-cupones.component';
import { EditCuponesComponent } from './components/cupones/edit-cupones/edit-cupones.component';
import { BusquedaInventarioComponent } from './components/inventario/busqueda-inventario/busqueda-inventario.component';
import { DetalleCuponesComponent } from './components/cupones/detalle-cupones/detalle-cupones.component';
import { IndexEtiquetadoComponent } from './components/etiquetado/index-etiquetado/index-etiquetado.component';

import { QRCodeModule } from 'angularx-qrcode';
import { PruebaEtiquetadoComponent } from './components/etiquetado/prueba-etiquetado/prueba-etiquetado.component';
import { ControlComercialComponent } from './components/informes/control-comercial/control-comercial.component';
import { DetalleProgramacionComponent } from './components/programacion/detalle-programacion/detalle-programacion.component';
import { GeneralProgramacionComponent } from './components/programacion/general-programacion/general-programacion.component';
import { ColorProgramacionComponent } from './components/programacion/color-programacion/color-programacion.component';
import { InfInventarioComponent } from './components/inventario/inf-inventario/inf-inventario.component';

import { ImportarProductoComponent } from './components/productos/importar-producto/importar-producto.component';
import { ReportePedidosComponent } from './components/informes/reporte-pedidos/reporte-pedidos.component';
import { PedidosInventarioComponent } from './components/inventario/pedidos-inventario/pedidos-inventario.component';
import { ImportarColoresComponent } from './components/productos/importar-colores/importar-colores.component';
import { ImportarRollosComponent } from './components/ingreso/importar-rollos/importar-rollos.component';
import { ImportarClientesComponent } from './components/crm/clientes/importar-clientes/importar-clientes.component';
import { IndexColoresComponent } from './components/colores/index-colores/index-colores.component';
import { DetailColoresComponent } from './components/colores/detail-colores/detail-colores.component';
import { IndexProductosProgramacionComponent } from './components/productos/index-productos-programacion/index-productos-programacion.component';
import { SidebarClientesComponent } from './components/crm/clientes/sidebar-clientes/sidebar-clientes.component';
import { FacturacionClientesComponent } from './components/crm/clientes/facturacion-clientes/facturacion-clientes.component';
import { PagosClientesComponent } from './components/crm/clientes/pagos-clientes/pagos-clientes.component';
import { CreditoClientesComponent } from './components/crm/clientes/credito-clientes/credito-clientes.component';
import { SolicitudClientesComponent } from './components/crm/clientes/solicitud-clientes/solicitud-clientes.component';
import { VentasEnCaminoComponent } from './components/informes/ventas-en-camino/ventas-en-camino.component';
import { VentasClientesComponent } from './components/crm/clientes/ventas-clientes/ventas-clientes.component';
import { SignupComponent } from './components/signup/signup.component';
import { OAuthModule } from 'angular-oauth2-oidc';
import { IndexEnvioComponent } from './components/envios/index-envio/index-envio.component';

import { GoogleMapsModule } from '@angular/google-maps';
import { IndexCuentaComponent } from './components/cuenta/index-cuenta/index-cuenta.component';
import { CreateCuentaComponent } from './components/cuenta/create-cuenta/create-cuenta.component';
import { EditCuentaComponent } from './components/cuenta/edit-cuenta/edit-cuenta.component';
import { CreateEnvioComponent } from './components/envios/create-envio/create-envio.component';
import { TaskColaboradoresComponent } from './components/colaboradores/task-colaboradores/task-colaboradores.component';
import { EnvioVentaGuestComponent } from './components/guest/envio-venta-guest/envio-venta-guest.component';
import { PermisosColaboradoresComponent } from './components/colaboradores/permisos-colaboradores/permisos-colaboradores.component'

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SideBarComponent,
    TopBarComponent,
    IndexColaboradoresComponent,
    CreateColaboradoresComponent,
    EditColaboradoresComponent,
    LoginComponent,
    IndexClientesComponent,
    CreateClientesComponent,
    EditClientesComponent,
    VerificationClienteComponent,
    UbicacionClientesComponent,
    IndexEmpresasComponent,
    RsEmpresasComponent,
    IndexRolesComponent,
    CreateRolesComponent,
    EditRolesComponent,
    DetailRolesComponent,
    CreateProductoComponent,
    IndexProductoComponent,
    EditProductoComponent,
    GaleriaProductoComponent,
    IndexIngresoComponent,
    CreateIngresoComponent,
    IndexProveedorComponent,
    CreateProveedorComponent,
    EditProveedorComponent,
    IndexPedidoComponent,
    CreatePedidoComponent,
    DetallePedidoComponent,
    PedidoDetalleComponent,
    EnvioPedidoComponent,
    DetalleIngresoComponent,
    SettingsComponent,
    IndexInventarioComponent,
    DetailInventarioComponent,
    IndexVentaComponent,
    CreateVentaComponent,
    DetalleVentaComponent,
    IndexOrdenComponent,
    DetalleOrdenComponent,
    IndexProgramacionComponent,
    CreateProgramacionComponent,
    IndexCobranzaComponent,
    CreateCobranzaComponent,
    CreaditoCobranzaComponent,
    DetalleProgramacionOrdenComponent,
    DetallePagoComponent,
    CobranzaKpiComponent,
    CobranzaClientesComponent,
    PagosMesClientesComponent,
    SidebarCobranzaKpiComponent,
    MillionCobranzaKpiComponent,
    ProductosCobranzaKpiComponent,
    SidebarVentasKpiComponent,
    ProductosVentasKpiComponent,
    ManualIngresoComponent,
    AsesorCobranzaKpiComponent,
    AsesorVentasKpiComponent,
    MiCuentaComponent,
    DetalleCobranzaComponent,
    HistorialInventarioComponent,
    SolicitudesCobranzaComponent,
    IndexDeudaComponent,
    GeneralInventarioComponent,
    IndexCuponesComponent,
    CreateCuponesComponent,
    EditCuponesComponent,
    BusquedaInventarioComponent,
    DetalleCuponesComponent,
    IndexEtiquetadoComponent,
    PruebaEtiquetadoComponent,
    ControlComercialComponent,
    DetalleProgramacionComponent,
    GeneralProgramacionComponent,
    ColorProgramacionComponent,
    InfInventarioComponent,
    ImportarProductoComponent,
    ReportePedidosComponent,
    PedidosInventarioComponent,
    ImportarColoresComponent,
    ImportarRollosComponent,
    ImportarClientesComponent,
    IndexColoresComponent,
    DetailColoresComponent,
    IndexProductosProgramacionComponent,
    SidebarClientesComponent,
    FacturacionClientesComponent,
    PagosClientesComponent,
    CreditoClientesComponent,
    SolicitudClientesComponent,
    VentasEnCaminoComponent,
    VentasClientesComponent,
    SignupComponent,
    IndexEnvioComponent,
    IndexCuentaComponent,
    CreateCuentaComponent,
    EditCuentaComponent,
    CreateEnvioComponent,
    TaskColaboradoresComponent,
    EnvioVentaGuestComponent,
    PermisosColaboradoresComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    routing,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgbModule,
    QRCodeModule,
    DragDropModule,
    OAuthModule.forRoot(),
    GoogleMapsModule
  ],
  providers: [
    CurrencyPipe,
    /* { provide: LOCALE_ID, useValue: 'es'} */

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
