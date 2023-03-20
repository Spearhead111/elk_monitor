import MyRequest from '../request/index'

export const UserInfoService = {
  /* 更新头像 */
  updateAvatar(params: any) {
    const url = '/userInfo/updateAvatar'
    return MyRequest.post(url, { avatar: params })
  },
  /* 更新昵称 */
  updateNickname(params: any) {
    const url = '/userInfo/updateNickname'
    return MyRequest.post(url, { nickname: params })
  },
}
