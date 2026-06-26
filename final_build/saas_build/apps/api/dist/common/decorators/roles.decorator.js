"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
const tenant_id_decorator_1 = require("./tenant-id.decorator");
Object.defineProperty(exports, "ROLES_KEY", { enumerable: true, get: function () { return tenant_id_decorator_1.ROLES_KEY; } });
const Roles = (...roles) => (0, common_1.SetMetadata)(tenant_id_decorator_1.ROLES_KEY, roles);
exports.Roles = Roles;
//# sourceMappingURL=roles.decorator.js.map