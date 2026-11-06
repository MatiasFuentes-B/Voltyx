
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductosModule } from './productos/productos.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { ProveedoresModule } from './proveedores/proveedores.module.js';
import { ComprasModule } from './compras/compras.module.js';
import { MovimientosModule } from './movimientos/movimientos.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('MYSQL_HOST'),
        port: Number(configService.get<string>('MYSQL_PORT')),
        username: configService.get<string>('MYSQL_USER'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    ProductosModule,
    CategoriasModule,
    ProveedoresModule,
    ComprasModule,
    MovimientosModule,
  ],
})
export class AppModule {}
