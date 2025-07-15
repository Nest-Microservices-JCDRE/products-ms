import {
  Injectable,
  OnModuleInit,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { PrismaClient } from 'generated/prisma'
import { PaginationDto } from '../common/dto/pagination.dto'

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductService')
  async onModuleInit() {
    await this.$connect()
    this.logger.log('Database connected')
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    })
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto

    const totalPages = await this.product.count()

    const lastPage = Math.ceil(totalPages / limit)

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    }
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id },
    })

    if (!product) throw new NotFoundException(`Product with id ${id} not found`)

    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id)

    return this.product.update({
      where: { id },
      data: updateProductDto,
    })
  }

  remove(id: number) {
    return this.product.delete({
      where: { id },
    })
  }
}
