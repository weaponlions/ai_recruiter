"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCloudEvent = buildCloudEvent;
/**
 * Factory to build a CloudEvent with sane defaults.
 */
function buildCloudEvent(type, source, tenantId, data) {
    return {
        specversion: '1.0',
        type,
        source,
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
        tenant_id: tenantId,
        datacontenttype: 'application/json',
        data,
    };
}
//# sourceMappingURL=cloud-event.js.map