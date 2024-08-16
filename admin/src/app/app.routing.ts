import { Routes, RouterModule } from "@angular/router";
import { ModuleWithProviders } from "@angular/core";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { IndexColaboradoresComponent } from "./components/colaboradores/index-colaboradores/index-colaboradores.component";
import { CreateColaboradoresComponent } from "./components/colaboradores/create-colaboradores/create-colaboradores.component";
import { EditColaboradoresComponent } from "./components/colaboradores/edit-colaboradores/edit-colaboradores.component";
import { LoginComponent } from "./components/login/login.component";

import { AuthGuard } from "./guards/auth.guard";
import { IndexClientesComponent } from "./components/crm/clientes/index-clientes/index-clientes.component";
import { CreateClientesComponent } from "./components/crm/clientes/create-clientes/create-clientes.component";
import { EditClientesComponent } from "./components/crm/clientes/edit-clientes/edit-clientes.component";
import { VerificationClienteComponent } from "./components/crm/clientes/verification-cliente/verification-cliente.component";
import { UbicacionClientesComponent } from "./components/crm/clientes/ubicacion-clientes/ubicacion-clientes.component";
import { IndexEmpresasComponent } from "./components/crm/empresas/index-empresas/index-empresas.component";
import { RsEmpresasComponent } from "./components/crm/empresas/rs-empresas/rs-empresas.component";
import { IndexRolesComponent } from "./components/roles/index-roles/index-roles.component";
import { CreateRolesComponent } from "./components/roles/create-roles/create-roles.component";
import { EditRolesComponent } from "./components/roles/edit-roles/edit-roles.component";
import { DetailRolesComponent } from "./components/roles/detail-roles/detail-roles.component";
import { IndexProductoComponent } from "./components/productos/index-producto/index-producto.component";
import { CreateProductoComponent } from "./components/productos/create-producto/create-producto.component";
import { EditProductoComponent } from "./components/productos/edit-producto/edit-producto.component";
import { GaleriaProductoComponent } from "./components/productos/galeria-producto/galeria-producto.component";
import { IndexIngresoComponent } from "./components/ingreso/index-ingreso/index-ingreso.component";
import { CreateIngresoComponent } from "./components/ingreso/create-ingreso/create-ingreso.component";
import { IndexProveedorComponent } from "./components/proveedor/index-proveedor/index-proveedor.component";
import { CreateProveedorComponent } from "./components/proveedor/create-proveedor/create-proveedor.component";
import { EditProveedorComponent } from "./components/proveedor/edit-proveedor/edit-proveedor.component";
import { IndexPedidoComponent } from "./components/pedido/index-pedido/index-pedido.component";
import { CreatePedidoComponent } from "./components/pedido/create-pedido/create-pedido.component";
import { DetallePedidoComponent } from "./components/pedido/detalle-pedido/detalle-pedido.component";
import { PedidoDetalleComponent } from "./components/publico/pedido-detalle/pedido-detalle.component";
import { EnvioPedidoComponent } from "./components/pedido/envio-pedido/envio-pedido.component";
import { DetalleIngresoComponent } from "./components/ingreso/detalle-ingreso/detalle-ingreso.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { IndexInventarioComponent } from "./components/inventario/index-inventario/index-inventario.component";
import { DetailInventarioComponent } from "./components/inventario/detail-inventario/detail-inventario.component";
import { IndexVentaComponent } from "./components/venta/index-venta/index-venta.component";
import { CreateVentaComponent } from "./components/venta/create-venta/create-venta.component";
import { DetalleVentaComponent } from "./components/venta/detalle-venta/detalle-venta.component";
import { IndexOrdenComponent } from "./components/orden/index-orden/index-orden.component";
import { DetalleOrdenComponent } from "./components/orden/detalle-orden/detalle-orden.component";
import { IndexProgramacionComponent } from "./components/programacion/index-programacion/index-programacion.component";
import { CreateProgramacionComponent } from "./components/programacion/create-programacion/create-programacion.component";
import { IndexCobranzaComponent } from "./components/cobranza/index-cobranza/index-cobranza.component";
import { CreateCobranzaComponent } from "./components/cobranza/create-cobranza/create-cobranza.component";
import { CreaditoCobranzaComponent } from "./components/cobranza/creadito-cobranza/creadito-cobranza.component";
import { DetalleProgramacionOrdenComponent } from "./components/orden/detalle-programacion-orden/detalle-programacion-orden.component";
import { DetallePagoComponent } from "./components/cobranza/detalle-pago/detalle-pago.component";
import { CobranzaKpiComponent } from "./components/kpis/cobranza/cobranza-kpi/cobranza-kpi.component";
import { CobranzaClientesComponent } from "./components/crm/clientes/cobranza-clientes/cobranza-clientes.component";
import { PagosMesClientesComponent } from "./components/crm/clientes/pagos-mes-clientes/pagos-mes-clientes.component";
import { MillionCobranzaKpiComponent } from "./components/kpis/cobranza/million-cobranza-kpi/million-cobranza-kpi.component";
import { ProductosCobranzaKpiComponent } from "./components/kpis/cobranza/productos-cobranza-kpi/productos-cobranza-kpi.component";
import { SideBarComponent } from "./components/side-bar/side-bar.component";
import { SidebarCobranzaKpiComponent } from "./components/kpis/cobranza/sidebar-cobranza-kpi/sidebar-cobranza-kpi.component";
import { SidebarVentasKpiComponent } from "./components/kpis/ventas/sidebar-ventas-kpi/sidebar-ventas-kpi.component";
import { ProductosVentasKpiComponent } from "./components/kpis/ventas/productos-ventas-kpi/productos-ventas-kpi.component";
import { ManualIngresoComponent } from "./components/ingreso/manual-ingreso/manual-ingreso.component";
import { AsesorCobranzaKpiComponent } from "./components/kpis/cobranza/asesor-cobranza-kpi/asesor-cobranza-kpi.component";
import { AsesorVentasKpiComponent } from "./components/kpis/ventas/asesor-ventas-kpi/asesor-ventas-kpi.component";
import { MiCuentaComponent } from "./components/mi-cuenta/mi-cuenta.component";
import { DetalleCobranzaComponent } from "./components/cobranza/detalle-cobranza/detalle-cobranza.component";
import { HistorialInventarioComponent } from "./components/inventario/historial-inventario/historial-inventario.component";
import { SolicitudesCobranzaComponent } from "./components/cobranza/solicitudes-cobranza/solicitudes-cobranza.component";
import { IndexDeudaComponent } from "./components/deudas/index-deuda/index-deuda.component";
import { GeneralInventarioComponent } from "./components/inventario/general-inventario/general-inventario.component";
import { IndexCuponesComponent } from "./components/cupones/index-cupones/index-cupones.component";
import { CreateCuponesComponent } from "./components/cupones/create-cupones/create-cupones.component";
import { EditCuponesComponent } from "./components/cupones/edit-cupones/edit-cupones.component";
import { BusquedaInventarioComponent } from "./components/inventario/busqueda-inventario/busqueda-inventario.component";
import { DetalleCuponesComponent } from "./components/cupones/detalle-cupones/detalle-cupones.component";
import { IndexEtiquetadoComponent } from "./components/etiquetado/index-etiquetado/index-etiquetado.component";
import { PruebaEtiquetadoComponent } from "./components/etiquetado/prueba-etiquetado/prueba-etiquetado.component";
import { DetalleProgramacionComponent } from "./components/programacion/detalle-programacion/detalle-programacion.component";
import { ColorProgramacionComponent } from "./components/programacion/color-programacion/color-programacion.component";
import { InfInventarioComponent } from "./components/inventario/inf-inventario/inf-inventario.component";
import { ImportarProductoComponent } from "./components/productos/importar-producto/importar-producto.component";
import { ReportePedidosComponent } from "./components/informes/reporte-pedidos/reporte-pedidos.component";
import { PedidosInventarioComponent } from "./components/inventario/pedidos-inventario/pedidos-inventario.component";
import { ImportarColoresComponent } from "./components/productos/importar-colores/importar-colores.component";
import { ImportarRollosComponent } from "./components/ingreso/importar-rollos/importar-rollos.component";
import { ImportarClientesComponent } from "./components/crm/clientes/importar-clientes/importar-clientes.component";
import { IndexColoresComponent } from "./components/colores/index-colores/index-colores.component";
import { DetailColoresComponent } from "./components/colores/detail-colores/detail-colores.component";
import { IndexProductosProgramacionComponent } from "./components/productos/index-productos-programacion/index-productos-programacion.component";
import { SidebarClientesComponent } from "./components/crm/clientes/sidebar-clientes/sidebar-clientes.component";
import { VentasEnCaminoComponent } from "./components/informes/ventas-en-camino/ventas-en-camino.component";
import { VentasClientesComponent } from "./components/crm/clientes/ventas-clientes/ventas-clientes.component";
import { SignupComponent } from "./components/signup/signup.component";
import { IndexEnvioComponent } from "./components/envios/index-envio/index-envio.component";
import { IndexCuentaComponent } from "./components/cuenta/index-cuenta/index-cuenta.component";
import { CreateCuentaComponent } from "./components/cuenta/create-cuenta/create-cuenta.component";
import { EditCuentaComponent } from "./components/cuenta/edit-cuenta/edit-cuenta.component";
import { CreateEnvioComponent } from "./components/envios/create-envio/create-envio.component";
import { TaskColaboradoresComponent } from "./components/colaboradores/task-colaboradores/task-colaboradores.component";
import { EnvioVentaGuestComponent } from "./components/guest/envio-venta-guest/envio-venta-guest.component";
import { PermisosColaboradoresComponent } from "./components/colaboradores/permisos-colaboradores/permisos-colaboradores.component";



const appRoutes : Routes = [
    {path: '',component: LoginComponent},
    {path: 'sign-up',component: SignupComponent},
    {path: 'dashboard',component: DashboardComponent, canActivate:[AuthGuard]},
    {path: 'settings',component: SettingsComponent, canActivate:[AuthGuard]},
    
    {path: 'seguridad/colaboradores',component: IndexColaboradoresComponent, canActivate:[AuthGuard]},
    {path: 'seguridad/colaboradores/create',component: CreateColaboradoresComponent, canActivate:[AuthGuard]},
    {path: 'seguridad/colaboradores/edit/:id',component: EditColaboradoresComponent, canActivate:[AuthGuard]},
    {path: 'seguridad/colaboradores/permisos/:id',component: PermisosColaboradoresComponent, canActivate:[AuthGuard]},

    {path: 'seguridad/roles',component: IndexRolesComponent, canActivate:[AuthGuard]},
    {path: 'inventario',component: IndexInventarioComponent, canActivate:[AuthGuard]},
    {path: 'inventario/:tipo',component: IndexInventarioComponent, canActivate:[AuthGuard]},
    {path: 'control-inventario',component: InfInventarioComponent, canActivate:[AuthGuard]},
    {path: 'inventario/general',component: GeneralInventarioComponent, canActivate:[AuthGuard]},
    {path: 'inventario/avanzado',component: BusquedaInventarioComponent, canActivate:[AuthGuard]},
    {path: 'inventario/detail/:id',component: DetailInventarioComponent, canActivate:[AuthGuard]},
    {path: 'inventario/pedidos/:id',component: PedidosInventarioComponent, canActivate:[AuthGuard]},
    {path: 'inventario/historial/:tipo/:id/:periodo',component: HistorialInventarioComponent, canActivate:[AuthGuard]},
    {path: 'seguridad/roles/create',component: CreateRolesComponent, canActivate:[AuthGuard]},
    {path: 'seguridad/roles/edit/:id',component: EditRolesComponent, canActivate:[AuthGuard]},
    {path: 'seguridad/roles/detail/:id',component: DetailRolesComponent, canActivate:[AuthGuard]},

    {path: 'clientes',component: IndexClientesComponent, canActivate:[AuthGuard]},
    {path: 'clientes/cobranza/:id',component: CobranzaClientesComponent, canActivate:[AuthGuard]},
    {path: 'clientes/pagos-mensuales/:id',component: PagosMesClientesComponent, canActivate:[AuthGuard]},
    {path: 'clientes/create',component: CreateClientesComponent, canActivate:[AuthGuard]},
    {path: 'clientes/importacion',component: ImportarClientesComponent, canActivate:[AuthGuard]},
    {path: 'clientes/:id',component: SidebarClientesComponent, canActivate:[AuthGuard]},
    {path: 'clientes/ubicaciones/:id',component: UbicacionClientesComponent, canActivate:[AuthGuard]},

    {path: 'empresas',component: IndexEmpresasComponent, canActivate:[AuthGuard]},
    {path: 'empresas/rs/:id',component: RsEmpresasComponent, canActivate:[AuthGuard]},
   
    {path: 'manufactura/productos/galeria/:id',component: GaleriaProductoComponent, canActivate:[AuthGuard]},
    {path: 'manufactura/productos',component: IndexProductoComponent, canActivate:[AuthGuard]},
    {path: 'manufactura/productos/telas/importacion',component: ImportarProductoComponent, canActivate:[AuthGuard]},
    {path: 'manufactura/colores/telas/importacion',component: ImportarColoresComponent, canActivate:[AuthGuard]},
    {path: 'productos',component: IndexProductoComponent, canActivate:[AuthGuard]},
    {path: 'productos/edit/:id',component: EditProductoComponent, canActivate:[AuthGuard]},
    {path: 'productos/create',component: CreateProductoComponent, canActivate:[AuthGuard]},
    
    {path: 'manufactura/productos/:tipo/programaciones',component: IndexProductosProgramacionComponent, canActivate:[AuthGuard]},
   

    {path: 'productos/colores',component: IndexColoresComponent, canActivate:[AuthGuard]},
    {path: 'productos/colores/:id',component: DetailColoresComponent, canActivate:[AuthGuard]},

    {path: 'proveedor',component: IndexProveedorComponent, canActivate:[AuthGuard]},
    {path: 'proveedor/create',component: CreateProveedorComponent, canActivate:[AuthGuard]},
    {path: 'proveedor/edit/:id',component: EditProveedorComponent, canActivate:[AuthGuard]},

    {path: 'pedidos',component: IndexPedidoComponent, canActivate:[AuthGuard]},
    {path: 'pedidos/create',component: CreatePedidoComponent, canActivate:[AuthGuard]},
    {path: 'pedidos/detail/:id',component: DetallePedidoComponent, canActivate:[AuthGuard]},
    {path: 'pedidos/envio',component: EnvioPedidoComponent, canActivate:[AuthGuard]},

    {path: 'ventas',component: IndexVentaComponent, canActivate:[AuthGuard]},
    {path: 'ventas/create',component: CreateVentaComponent, canActivate:[AuthGuard]},
    {path: 'ventas/detail/:id',component: DetalleVentaComponent, canActivate:[AuthGuard]},
   
    {path: 'cuentas',component: IndexCuentaComponent, canActivate:[AuthGuard]},
    {path: 'cuentas/create',component: CreateCuentaComponent, canActivate:[AuthGuard]},
    {path: 'cuentas/edit/:id',component: EditCuentaComponent, canActivate:[AuthGuard]},

    {path: 'ingresos',component: IndexIngresoComponent, canActivate:[AuthGuard]},
    {path: 'ingresos/proveedor',component: CreateIngresoComponent, canActivate:[AuthGuard]},
    {path: 'ingresos/manual',component: ManualIngresoComponent, canActivate:[AuthGuard]},
    {path: 'manufactura/ingresos/importacion/rollos',component: ImportarRollosComponent, canActivate:[AuthGuard]},
    {path: 'ingresos/detail/:id',component: DetalleIngresoComponent, canActivate:[AuthGuard]},

    {path: 'ordenes',component: IndexOrdenComponent, canActivate:[AuthGuard]},
    {path: 'ordenes/detail/:id',component: DetalleOrdenComponent, canActivate:[AuthGuard]},
    {path: 'ordenes/programaciones/:id',component: DetalleProgramacionOrdenComponent, canActivate:[AuthGuard]},

    {path: 'envios',component: IndexEnvioComponent, canActivate:[AuthGuard]},
    {path: 'envios/create/:id',component: CreateEnvioComponent, canActivate:[AuthGuard]},

    {path: 'programaciones/create',component: CreateProgramacionComponent, canActivate:[AuthGuard]},
    {path: 'programaciones',component: IndexProgramacionComponent, canActivate:[AuthGuard]},
    {path: 'programaciones/detail/:id',component: DetalleProgramacionComponent, canActivate:[AuthGuard]},
    {path: 'programaciones/color/:id',component: ColorProgramacionComponent, canActivate:[AuthGuard]},
    {path: 'solicitudes',component: SolicitudesCobranzaComponent, canActivate:[AuthGuard]},
    
    {path: 'notas',component: IndexDeudaComponent, canActivate:[AuthGuard]},

    {path: 'cobranzas',component: IndexCobranzaComponent, canActivate:[AuthGuard]},
    {path: 'cobranzas/creditos',component: CreaditoCobranzaComponent, canActivate:[AuthGuard]},
    {path: 'cobranzas/create',component: CreateCobranzaComponent, canActivate:[AuthGuard]},
    {path: 'cobranzas/pago/detail/:id',component: DetallePagoComponent, canActivate:[AuthGuard]},
    {path: 'cobranzas/detail/:tipo/:id',component: DetalleCobranzaComponent, canActivate:[AuthGuard]},

    {path: 'reportes/cobranza',component: SidebarCobranzaKpiComponent, canActivate:[AuthGuard]},
    {path: 'reportes/cobranza/mensual',component: CobranzaKpiComponent, canActivate:[AuthGuard]},
    {path: 'reportes/cobranza/million',component: MillionCobranzaKpiComponent, canActivate:[AuthGuard]},
    {path: 'reportes/cobranza/productos',component: ProductosCobranzaKpiComponent, canActivate:[AuthGuard]},
    {path: 'reportes/cobranza/asesores',component: AsesorCobranzaKpiComponent, canActivate:[AuthGuard]},

    {path: 'reportes/ventas',component: SidebarVentasKpiComponent, canActivate:[AuthGuard]},
    {path: 'reportes/ventas/productos',component: ProductosVentasKpiComponent, canActivate:[AuthGuard]},
    {path: 'reportes/ventas/asesores',component: AsesorVentasKpiComponent, canActivate:[AuthGuard]},

    {path: 'cupones',component: IndexCuponesComponent, canActivate:[AuthGuard]},
    {path: 'cupones/create',component: CreateCuponesComponent, canActivate:[AuthGuard]},
    {path: 'cupones/detail/:codigo',component: DetalleCuponesComponent, canActivate:[AuthGuard]},

    {path: 'etiquetado',component: IndexEtiquetadoComponent, canActivate:[AuthGuard]},
    {path: 'etiquetado/:id',component: PruebaEtiquetadoComponent, canActivate:[AuthGuard]},

    {path: 'informes/reporte-pedidos',component: ReportePedidosComponent, canActivate:[AuthGuard]},
    {path: 'informes/reporte-pedidos/:id',component: ReportePedidosComponent, canActivate:[AuthGuard]},
    {path: 'informes/ventas-en-camino',component: VentasEnCaminoComponent, canActivate:[AuthGuard]},

    {path: 'public/pedido/:id',component: PedidoDetalleComponent},

    {path: 'verification/:tipo/:token',component: VerificationClienteComponent},

    {path: 'profile',component: MiCuentaComponent, canActivate:[AuthGuard]},
    {path: 'tasks',component: TaskColaboradoresComponent, canActivate:[AuthGuard]},

    {path: 'guest/envios',component: EnvioVentaGuestComponent, canActivate:[AuthGuard]},
]

export const appRoutingProviders : any[] = [];
export const routing : ModuleWithProviders<any> = RouterModule.forRoot(appRoutes);