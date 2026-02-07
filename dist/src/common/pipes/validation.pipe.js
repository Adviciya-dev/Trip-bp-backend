"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalValidationPipe = void 0;
const common_1 = require("@nestjs/common");
exports.globalValidationPipe = new common_1.ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
        enableImplicitConversion: true,
    },
});
//# sourceMappingURL=validation.pipe.js.map