import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('files')
export class FilesController {
  
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    // 1. CONFIGURACIÓN DE ALMACENAMIENTO
    storage: diskStorage({
      destination: './uploads', // Carpeta donde se guardará
      filename: (req, file, cb) => {
        // Generar nombre único: "123456789-nombre.jpg"
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        cb(null, filename);
      }
    }),
    // 2. FILTRO (SOLO IMÁGENES)
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Solo se permiten imágenes (jpg, jpeg, png, gif)'), false);
      }
      cb(null, true);
    }
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }

    // 3. RETORNAR LA URL PÚBLICA
    // Esto es lo que guardarás en tu base de datos (campo imagenUrl)
    // Asegúrate de que http://localhost:3000 coincida con tu puerto real
    const url = `http://localhost:3000/uploads/${file.filename}`;
    
    return {
      message: 'Archivo subido con éxito',
      url: url
    };
  }
}