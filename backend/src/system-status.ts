import si from 'systeminformation';
import os from 'os';
import { execSync } from 'child_process';

function secondsToHuman(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function bytesToGB(bytes: number) {
  return bytes / 1_000_000_000;
}

export async function getSystemStatus() {
  const mem = await si.mem();
  const disk = await si.fsSize();
  const cpu = await si.cpu();
  const cpuLoad = await si.currentLoad();
  const cpuTemp = await si.cpuTemperature();
  const osInfo = await si.osInfo();

  let sshStatus = 'Offline';
  try {
    execSync('systemctl is-active --quiet ssh');
    sshStatus = 'Online';
  } catch {}

  return {
    uptime: secondsToHuman(os.uptime()),
    cpuUsage: `${cpuLoad.currentLoad.toFixed(2)}%`,
    memoryUsage: `${bytesToGB(mem.used).toFixed(2)} / ${bytesToGB(mem.total).toFixed(2)} GB (${(mem.used / mem.total * 100).toFixed(2)}%)`,
    diskUsage: `${bytesToGB(disk[0].used).toFixed(2)} / ${bytesToGB(disk[0].size).toFixed(2)} GB (${disk[0].use.toFixed(2)}%)`,
    os: os.type(),
    osName: `${osInfo.distro} ${osInfo.release}`,
    processor: cpu.manufacturer + ' ' + cpu.brand,
    cpuCoresLogical: cpu.cores,
    cpuCoresPhysical: cpu.physicalCores,
    cpuFrequency: `${cpu.speed.toFixed(2)} GHz (Min: ${cpu.speedMin} GHz, Max: ${cpu.speedMax} GHz)`,
    cpuTemperature: cpuTemp.main ? `${cpuTemp.main}°C` : 'Not Available',
    ssh: sshStatus,
  };
}

