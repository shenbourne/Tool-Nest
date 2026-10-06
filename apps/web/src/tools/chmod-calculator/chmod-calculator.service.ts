import type { GroupPermissions, Permissions } from './chmod-calculator.types';

export { computeChmodOctalRepresentation, computeChmodSymbolicRepresentation, parseOctalToPermissions, parseSymbolicToPermissions };

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

function digitToGroupPermission(digit: number): GroupPermissions {
  return {
    read: (digit & 4) !== 0,
    write: (digit & 2) !== 0,
    execute: (digit & 1) !== 0,
  };
}

function parseOctalToPermissions(octal: string): Permissions | null {
  if (!/^[0-7]{3}$/.test(octal)) {
    return null;
  }
  const [owner, group, pub] = octal.split('').map(Number);
  return {
    owner: digitToGroupPermission(owner),
    group: digitToGroupPermission(group),
    public: digitToGroupPermission(pub),
  };
}

function tripletToGroupPermission(triplet: string): GroupPermissions | null {
  if (!/^[rwx-]{3}$/.test(triplet)) {
    return null;
  }
  return {
    read: triplet[0] === 'r',
    write: triplet[1] === 'w',
    execute: triplet[2] === 'x',
  };
}

function parseSymbolicToPermissions(symbolic: string): Permissions | null {
  if (!/^[rwx-]{9}$/.test(symbolic)) {
    return null;
  }
  const owner = tripletToGroupPermission(symbolic.slice(0, 3));
  const group = tripletToGroupPermission(symbolic.slice(3, 6));
  const pub = tripletToGroupPermission(symbolic.slice(6, 9));
  if (!owner || !group || !pub) {
    return null;
  }
  return { owner, group, public: pub };
}
