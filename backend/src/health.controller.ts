import { Controller, Get } from "@nestjs/common";

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}

export { HealthController };