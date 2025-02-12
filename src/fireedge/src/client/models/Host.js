/* ------------------------------------------------------------------------- *
 * Copyright 2002-2022, OpenNebula Project, OpenNebula Systems               *
 *                                                                           *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may   *
 * not use this file except in compliance with the License. You may obtain   *
 * a copy of the License at                                                  *
 *                                                                           *
 * http://www.apache.org/licenses/LICENSE-2.0                                *
 *                                                                           *
 * Unless required by applicable law or agreed to in writing, software       *
 * distributed under the License is distributed on an "AS IS" BASIS,         *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  *
 * See the License for the specific language governing permissions and       *
 * limitations under the License.                                            *
 * ------------------------------------------------------------------------- */
import { prettyBytes } from 'client/utils'
import {
  DEFAULT_CPU_MODELS,
  CUSTOM_HOST_HYPERVISOR,
  Host,
  HOST_STATES,
  STATES,
  HYPERVISORS,
  NumaNode,
  PciDevice,
} from 'client/constants'
import { useGetOneConfigQuery } from 'client/features/OneApi/system'

/**
 * Returns information about the host state.
 *
 * @param {Host} host - Host
 * @returns {STATES.StateInfo} Host state object
 */
export const getState = (host) => HOST_STATES[+host?.STATE ?? 0]

/**
 * @param {Host} host - Host
 * @returns {Array} List of datastores from resource
 */
export const getDatastores = (host) =>
  [host?.HOST_SHARE?.DATASTORES?.DS ?? []].flat()

/**
 * Returns the allocate information.
 *
 * @param {Host} host - Host
 * @returns {{
 * percentCpuUsed: number,
 * percentCpuLabel: string,
 * percentMemUsed: number,
 * percentMemLabel: string
 * }} Allocated information object
 */
export const getAllocatedInfo = (host) => {
  const { CPU_USAGE, TOTAL_CPU, MEM_USAGE, TOTAL_MEM } = host?.HOST_SHARE ?? {}

  const percentCpuUsed = (+CPU_USAGE * 100) / +TOTAL_CPU || 0
  const percentCpuLabel = `${CPU_USAGE} / ${TOTAL_CPU} 
    (${Math.round(isFinite(percentCpuUsed) ? percentCpuUsed : '--')}%)`

  const isMemUsageNegative = +MEM_USAGE < 0
  const percentMemUsed = (+MEM_USAGE * 100) / +TOTAL_MEM || 0
  const usedMemBytes = prettyBytes(Math.abs(+MEM_USAGE))
  const totalMemBytes = prettyBytes(+TOTAL_MEM)
  const percentMemLabel = `${
    isMemUsageNegative ? '-' : ''
  }${usedMemBytes} / ${totalMemBytes} 
      (${Math.round(isFinite(percentMemUsed) ? percentMemUsed : '--')}%)`

  return {
    percentCpuUsed,
    percentCpuLabel,
    percentMemUsed,
    percentMemLabel,
  }
}

/**
 * Returns list of hugepage sizes from the host numa nodes.
 *
 * @param {Host} host - Host
 * @returns {Array} List of hugepages sizes from resource
 */
export const getHugepageSizes = (host) => {
  const numaNodes = [host?.HOST_SHARE?.NUMA_NODES?.NODE ?? []].flat()

  return numaNodes
    .filter((node) => node?.NODE_ID && node?.HUGEPAGE)
    .map((node) => node.HUGEPAGE.map(({ SIZE }) => +SIZE))
    .flat()
}

/**
 * Returns list of PCI devices from the host.
 *
 * @param {Host} host - Host
 * @returns {PciDevice[]} List of PCI devices from resource
 */
export const getPciDevices = (host) =>
  [host?.HOST_SHARE?.PCI_DEVICES?.PCI ?? []].flat().filter(Boolean)

/**
 * Returns list of KVM CPU Models available from the host pool.
 *
 * @param {Host[]} hosts - Hosts
 * @returns {Array} List of KVM CPU Models from the pool
 */
export const getKvmCpuModels = (hosts = []) =>
  hosts
    .filter((host) => host?.TEMPLATE?.HYPERVISOR === HYPERVISORS.kvm)
    .map((host) => host.TEMPLATE?.KVM_CPU_MODELS.split(' '))
    .flat()

/**
 * Returns list of KVM Machines available from the host pool.
 *
 * @param {Host[]} hosts - Hosts
 * @returns {Array} List of KVM Machines from the pool
 */
export const getKvmMachines = (hosts = []) => {
  const machineTypes = hosts
    .filter((host) => host?.TEMPLATE?.HYPERVISOR === HYPERVISORS.kvm)
    .map((host) => host.TEMPLATE?.KVM_MACHINES.split(' '))
    .flat()

  return [DEFAULT_CPU_MODELS, ...machineTypes]
}

/**
 * Returns list of Zombies available from the host.
 *
 * @param {Host} host - Host
 * @returns {object[]} - List of zombies from host
 */
export const getHostZombies = (host = {}) => {
  const zombies = host?.TEMPLATE?.ZOMBIES?.split(', ') ?? []

  const vms = [host?.TEMPLATE?.VM ?? []]
    .flat()
    .filter((vm) => vm?.IMPORT_TEMPLATE)

  return vms.filter((vm) => vm?.VM_NAME && zombies.includes(vm?.VM_NAME))
}

/**
 * Returns list of Wilds available from the host.
 *
 * @param {Host} host - Host
 * @returns {object[]} - List of wilds from host
 */
export const getHostWilds = (host = {}) => {
  const wilds = host?.TEMPLATE?.WILDS?.split(', ') ?? []

  const vms = [host?.TEMPLATE?.VM ?? []]
    .flat()
    .filter((vm) => vm?.IMPORT_TEMPLATE)

  return vms.filter((vm) => vm?.VM_NAME && wilds.includes(vm?.VM_NAME))
}

/**
 * Returns list of Numa available from the host.
 *
 * @param {Host} host - Host
 * @returns {NumaNode[]} - List of Numa nodes from host
 */
export const getHostNuma = (host = {}) =>
  [host?.HOST_SHARE?.NUMA_NODES?.NODE ?? []].flat()

/**
 * Returns the Numa Node memory information.
 *
 * @param {NumaNode} numa - Host Numa
 * @returns {{
 * percentMemUsed: number,
 * percentMemLabel: string
 * }} Numa Node memory information
 */
export const getNumaMemory = (numa) => {
  const { TOTAL, USED } = numa?.MEMORY ?? {}

  const percentMemUsed = (+USED * 100) / +TOTAL || 0

  const usedMemBytes = prettyBytes(Math.abs(+USED))
  const totalMemBytes = prettyBytes(+TOTAL)
  const percentMemLabel = `${usedMemBytes} / ${totalMemBytes} 
      (${Math.round(isFinite(percentMemUsed) ? percentMemUsed : '--')}%)`

  return {
    percentMemUsed,
    percentMemLabel,
  }
}

/**
 * Returns list of Hypervisors available to the host.
 *
 * @param {object} [options] - Options to conversion
 * @param {boolean} [options.includeCustom] - If `true`, add an Custom hypervisor
 * @returns {object[]} - List of hypervisors
 */
export const getHostHypervisors = (options = {}) => {
  const { includeCustom = false } = options
  const { data } = useGetOneConfigQuery()
  const { VM_MAD } = data

  return [VM_MAD ?? [], includeCustom ? CUSTOM_HOST_HYPERVISOR : []]
    .flat()
    .filter((hypervisor) => hypervisor.NAME !== HYPERVISORS.vcenter)
    .map((hypervisor) => ({
      displayName: hypervisor.SUNSTONE_NAME,
      driverName: hypervisor.NAME,
    }))
}
