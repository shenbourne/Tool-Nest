import type { GroupPermissions, Permissions } from './chmod-calculator.types';

export { computeChmodOctalRepresentation, computeChmodSymbolicRepresentation };

const permissionValue = { read: 4, write: 2, execute: 1 };

function getGroupPermissionValue(permission: GroupPermissions): number {
  return (permission.read ? permissionValue.read : 0)
    + (permission.write ? permissionValue.write : 0)
    + (permission.execute ? permissionValue.execute : 0);
}

function computeChmodOctalRepresentation({ permissions }: { permissions: Permissions }): string {
  return [
    getGroupPermissionValue(permissions.owner),
    getGroupPermissionValue(permissions.group),
    getGroupPermissionValue(permissions.public),
  ].join('');
}

const symbolicValue = { read: 'r', write: 'w', execute: 'x' };

function getGroupSymbolicValue(permission: GroupPermissions): string {
  return (permission.read ? symbolicValue.read : '-')
    + (permission.write ? symbolicValue.write : '-')
    + (permission.execute ? symbolicValue.execute : '-');
}

function computeChmodSymbolicRepresentation({ permissions }: { permissions: Permissions }): string {
  return [
    getGroupSymbolicValue(permissions.owner),
    getGroupSymbolicValue(permissions.group),
    getGroupSymbolicValue(permissions.public),
  ].join('');
}
