<template xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <el-menu mode="vertical"  :default-active="$route.path">
        <div class="sidelogo">
          <span><i class="el-icon-setting"></i></span>
          <span class="sidelogotxt">&nbsp;&nbsp;全景编辑</span>
        </div>
        <!--<el-tabs type="border-card" v-model="activeName">-->
        <el-tabs type="border-card">
            <!--<el-tab-pane label="新建项目" name="user">-->
                <!--<el-form label-position="left" label-width="100px">-->
                    <!--<div class="sideItem">-->
                        <!--<el-form-item label="项目名称">-->
                            <!--<el-input size="small" v-model="shortName"></el-input>-->
                        <!--</el-form-item>-->
                        <!--<el-form-item label="地址">-->
                            <!--<el-input size="small" v-model="address"></el-input>-->
                        <!--</el-form-item>-->
                        <!--<el-form-item label="经度">-->
                            <!--<el-input size="small" v-model="longitude"></el-input>-->
                        <!--</el-form-item>-->
                        <!--<el-form-item label="纬度">-->
                            <!--<el-input size="small" v-model="latitude"></el-input>-->
                        <!--</el-form-item>-->
                        <!--<el-form-item label="补充说明">-->
                            <!--<el-input type="textarea" v-model="info"></el-input>-->
                        <!--</el-form-item>-->
                        <!--<div style="text-align:center">-->
                            <!--<el-button type="primary" @click="sendProject">确定</el-button>-->
                        <!--</div>-->
                    <!--</div>-->
                <!--</el-form>-->
            <!--</el-tab-pane>-->

          <el-button type="primary" @click="dialogFormVisible = true" style="width:266px">
            添加场景<i class="el-icon-plus"></i>
          </el-button>
          <el-dialog title="全景图片:" :visible.sync="dialogFormVisible">
            <el-form>
              <el-form-item label="上传" :label-width="formLabelWidth">
                <el-upload
                  class="upload-panorama1"
                  v-bind:action=ajaxUrl1
                  :on-remove="panoHandleRemove"
                  :before-remove="beforeRemove"
                  :onError="uploadError"
                  :onSuccess="panoUploadSuccess">
                  <el-button size="small" type="primary">请上传全景照片</el-button>
                </el-upload>
              </el-form-item>
              <el-form-item label="类型" :label-width="formLabelWidth">
                <el-select size="small" v-model="imgType">
                  <el-option label="Auto" value="Auto"></el-option>
                  <el-option label="Equirectangular" value="Equirectangular"></el-option>
                  <el-option label="Cube Faces" value="Cube Faces"></el-option>
                  <el-option label="Cylindrical" value="Cylindrical"></el-option>
                  <el-option label="Flat" value="Flat"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="文件名" :label-width="formLabelWidth">
                <!--<el-input v-model="fileName" autocomplete="off"></el-input>-->
                <el-input size="small" id="image" v-model="fileName" :disabled="true" style="width:200px"></el-input>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="dialogFormVisible = false">取 消</el-button>
              <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
            </div>
          </el-dialog>


          <!--被注释的场景，热点参数，热点管理三个tab-->
          <div>
            <!--<el-tab-pane label="场景" name="scene">-->
              <!--<el-form label-position="left" label-width="100px">-->
                <!--<div class="sideItem">-->
                  <!--<div class="sidetitle">全景图片:</div>-->
                  <!--<el-form-item label="上传">-->
                    <!--<el-upload-->
                      <!--class="upload-panorama1"-->
                      <!--v-bind:action=ajaxUrl1-->
                      <!--:on-remove="panoHandleRemove"-->
                      <!--:before-remove="beforeRemove"-->
                      <!--:onError="uploadError"-->
                      <!--:onSuccess="panoUploadSuccess">-->
                      <!--<el-button size="small" type="primary">请上传全景照片</el-button>-->
                    <!--</el-upload>-->
                  <!--</el-form-item>-->
                  <!--<el-form-item label="类型">-->
                    <!--<el-select size="small" v-model="imgType">-->
                      <!--<el-option label="Auto" value="Auto"></el-option>-->
                      <!--<el-option label="Equirectangular" value="Equirectangular"></el-option>-->
                      <!--<el-option label="Cube Faces" value="Cube Faces"></el-option>-->
                      <!--<el-option label="Cylindrical" value="Cylindrical"></el-option>-->
                      <!--<el-option label="Flat" value="Flat"></el-option>-->
                    <!--</el-select>-->
                  <!--</el-form-item>-->
                  <!--<el-form-item label="文件名">-->
                    <!--<el-input size="small" id="image" v-model="fileName" :disabled="true"></el-input>-->
                  <!--</el-form-item>-->
                <!--</div>-->
                <!--&lt;!&ndash;在场景预览中每个图片上绑定事件，点击图片获取图片的src,将src传到state.imgFile中。&ndash;&gt;-->
                <!--<div class="sideItem">-->
                  <!--<div class="sidetitle">场景预览:</div>-->
                  <!--<el-form label-position="left" label-width="150px">-->
                    <!--<div class="sideItem">-->
                      <!--<ul style="padding: 0">-->
                        <!--<li v-for="item in fileUrlArr" @click="changeImgFile">-->
                          <!--<img v-bind:src=item.fileUrl  v-bind:title=item.fileName width="270px" height="135px">-->
                        <!--</li>-->
                      <!--</ul>-->
                    <!--</div>-->
                  <!--</el-form>-->
                <!--</div>-->

              <!--</el-form>-->

            <!--</el-tab-pane>-->
          </div>
          <div>
            <!--2018.5.22新增-->
            <!--<el-tab-pane label="热点参数" name="hotSpot">-->
              <!--<el-form label-position="left" label-width="100px">-->
                <!--<div class="sideItem">-->
                  <!--<div v-show="this.$store.state.test.isImgHotSpot">-->
                    <!--<div class="sidetitle">热点类型:</div>-->
                    <!--<el-form-item label="热点类型">-->
                      <!--&lt;!&ndash;<div v-show=""></div>&ndash;&gt;-->
                      <!--<el-select size="small" v-model="value" clearable @change="saveSelectHotType(value)"-->
                                 <!--:placeholder="hotSpotsType?hotSpotsType:'请选择热点类型'">-->
                        <!--<el-option-->
                          <!--v-for="item in hotSpotsTypes"-->
                          <!--:key="item.value"-->
                          <!--:label="item.label"-->
                          <!--:value="item.value">-->
                        <!--</el-option>-->
                      <!--</el-select>-->

                    <!--</el-form-item>-->
                    <!--<div v-show="this.hotSpotsType==='URL热点'">-->
                      <!--<el-form-item label="跳转链接">-->
                        <!--<el-input v-bind:value="hotUrl" ref="input4" clearable @blur.prevent="saveInputHotUrl()"-->
                                  <!--placeholder="确认后点击确定"></el-input>-->
                        <!--&lt;!&ndash;<el-input placeholder="确认后点击确定" v-model='hotUrl' size="small"></el-input>&ndash;&gt;-->
                      <!--</el-form-item>-->
                      <!--<div style="text-align:center">-->
                        <!--<el-button type="primary" @click="saveUrlHotSpot">确定</el-button>-->
                      <!--</div>-->
                    <!--</div>-->
                    <!--<div v-show="this.hotSpotsType==='图像热点'">-->
                      <!--<el-form-item label="已上传图片">-->

                        <!--<el-select size="small" v-model="value1" clearable @change="saveSelectUploadPicture(value1)"-->
                                   <!--:placeholder="hotSpotsImg?hotSpotsImg:'请选择已上传图片'">-->
                          <!--<el-option-->
                            <!--v-for="item in this.$store.state.test.hotSpotsImgs"-->
                            <!--:key="item.value"-->
                            <!--:label="item.label"-->
                            <!--:value="item.value">-->
                          <!--</el-option>-->
                        <!--</el-select>-->

                      <!--</el-form-item>-->
                      <!--<el-form-item label="图片上传">-->
                        <!--<el-upload-->
                          <!--class="upload-panorama1"-->
                          <!--v-bind:action=ajaxUrl2-->
                          <!--:on-remove="imgHandleRemove"-->
                          <!--:before-remove="beforeRemove"-->
                          <!--:onError="uploadError"-->
                          <!--:onSuccess="imgUploadSuccess">-->
                          <!--<el-button size="small" type="primary">请上传热点图片</el-button>-->
                        <!--</el-upload>-->
                      <!--</el-form-item>-->
                      <!--<div style="text-align:center">-->
                        <!--<el-button type="primary" @click="saveImageHotSpot">确定</el-button>-->
                      <!--</div>-->
                    <!--</div>-->
                  <!--</div>-->
                  <!--<div v-show="this.$store.state.test.isJumpHotSpot">-->
                    <!--<div class="sidetitle">跳转热点:</div>-->
                    <!--<el-form-item label="目标场景">-->

                      <!--<el-select size="small" v-model="value2" clearable @change="saveSelectJumpScene(value2)"-->
                                 <!--:placeholder="hotTarget?hotTarget:'请选择要跳转的场景'">-->
                        <!--<el-option-->
                          <!--v-for="item in targetOptions"-->
                          <!--:key="item.value"-->
                          <!--:label="item.label"-->
                          <!--:value="item.value">-->
                        <!--</el-option>-->
                      <!--</el-select>-->

                    <!--</el-form-item>-->
                    <!--<el-form-item label="场景说明">-->
                      <!--<el-input v-bind:value="hotIntroduction" ref="input3" clearable @blur.prevent="saveInputHotIntroduction()"-->
                                <!--placeholder="确认后点击确定"></el-input>-->
                      <!--&lt;!&ndash;<el-input placeholder="确认后点击确定" v-model='hotIntroduction' size="small"></el-input>&ndash;&gt;-->
                    <!--</el-form-item>-->
                    <!--<div style="text-align:center">-->
                      <!--<el-button type="primary" @click="saveJumpHotSpot">确定</el-button>-->
                    <!--</div>-->
                  <!--</div>-->

                <!--</div>-->
              <!--</el-form>-->
            <!--</el-tab-pane>-->
          </div>
          <div>
            <!--<el-tab-pane label="热点管理" name="admin">-->

            <!--<el-form label-position="left" label-width="100px">-->
            <!--<div class="sideItem">-->
            <!--<div v-show="this.$store.state.test.isImgHotSpot">-->
            <!--<div class="sidetitle">热点类型:</div>-->
            <!--<el-form-item label="热点类型">-->
            <!--&lt;!&ndash;<div v-show=""></div>&ndash;&gt;-->
            <!--<el-select size="small" v-model="value" clearable @change="saveSelectHotType(value)"-->
            <!--:placeholder="hotSpotsType?hotSpotsType:'请选择热点类型'">-->
            <!--<el-option-->
            <!--v-for="item in hotSpotsTypes"-->
            <!--:key="item.value"-->
            <!--:label="item.label"-->
            <!--:value="item.value">-->
            <!--</el-option>-->
            <!--</el-select>-->

            <!--</el-form-item>-->
            <!--<div v-show="this.hotSpotsType==='URL热点'">-->
            <!--<el-form-item label="跳转链接">-->
            <!--<el-input v-bind:value="hotUrl" ref="input4" clearable @blur.prevent="saveInputHotUrl()"-->
            <!--placeholder="确认后点击确定"></el-input>-->
            <!--&lt;!&ndash;<el-input placeholder="确认后点击确定" v-model='hotUrl' size="small"></el-input>&ndash;&gt;-->
            <!--</el-form-item>-->
            <!--<div style="text-align:center">-->
            <!--<el-button type="primary" @click="saveUrlHotSpot">确定</el-button>-->
            <!--</div>-->
            <!--</div>-->
            <!--<div v-show="this.hotSpotsType==='图像热点'">-->
            <!--<el-form-item label="已上传图片">-->

            <!--<el-select size="small" v-model="value1" clearable @change="saveSelectUploadPicture(value1)"-->
            <!--:placeholder="hotSpotsImg?hotSpotsImg:'请选择已上传图片'">-->
            <!--<el-option-->
            <!--v-for="item in this.$store.state.test.hotSpotsImgs"-->
            <!--:key="item.value"-->
            <!--:label="item.label"-->
            <!--:value="item.value">-->
            <!--</el-option>-->
            <!--</el-select>-->

            <!--</el-form-item>-->
            <!--<el-form-item label="图片上传">-->
            <!--<el-upload-->
            <!--class="upload-panorama1"-->
            <!--v-bind:action=ajaxUrl2-->
            <!--:on-remove="imgHandleRemove"-->
            <!--:before-remove="beforeRemove"-->
            <!--:onError="uploadError"-->
            <!--:onSuccess="imgUploadSuccess">-->
            <!--<el-button size="small" type="primary">请上传热点图片</el-button>-->
            <!--</el-upload>-->
            <!--</el-form-item>-->
            <!--<div style="text-align:center">-->
            <!--<el-button type="primary" @click="saveImageHotSpot">确定</el-button>-->
            <!--</div>-->
            <!--</div>-->
            <!--</div>-->
            <!--<div v-show="this.$store.state.test.isJumpHotSpot">-->
            <!--<div class="sidetitle">跳转热点:</div>-->
            <!--<el-form-item label="目标场景">-->

            <!--<el-select size="small" v-model="value2" clearable @change="saveSelectJumpScene(value2)"-->
            <!--:placeholder="hotTarget?hotTarget:'请选择要跳转的场景'">-->
            <!--<el-option-->
            <!--v-for="item in targetOptions"-->
            <!--:key="item.value"-->
            <!--:label="item.label"-->
            <!--:value="item.value">-->
            <!--</el-option>-->
            <!--</el-select>-->

            <!--</el-form-item>-->
            <!--<el-form-item label="场景说明">-->
            <!--<el-input v-bind:value="hotIntroduction" ref="input3" clearable @blur.prevent="saveInputHotIntroduction()"-->
            <!--placeholder="确认后点击确定"></el-input>-->
            <!--&lt;!&ndash;<el-input placeholder="确认后点击确定" v-model='hotIntroduction' size="small"></el-input>&ndash;&gt;-->
            <!--</el-form-item>-->
            <!--<div style="text-align:center">-->
            <!--<el-button type="primary" @click="saveJumpHotSpot">确定</el-button>-->
            <!--</div>-->
            <!--</div>-->

            <!--</div>-->
            <!--</el-form>-->

            <!--<div class="tree">-->
            <!--<div class="el-tree">-->
            <!--<div class="el-tree-node" v-for="(item,index) in Tree">-->
            <!--&lt;!&ndash;节点内容&ndash;&gt;-->
            <!--<div class="el-tree-node__content" style="padding-left: 0px;">-->

            <!--<span @click.stop="expand">-->
            <!--<span v-if="expandicon===item.label" class="el-tree-node__expand-icon expanded"></span>-->
            <!--<span v-else class="el-tree-node__expand-icon "></span>-->
            <!--</span>-->

            <!--<span class="custom-tree-node">-->
            <!--&lt;!&ndash;场景信息&ndash;&gt;-->
            <!--<span>{{item.label}}</span>-->
            <!--<span>-->
            <!--&lt;!&ndash;添加按钮&ndash;&gt;-->
            <!--<i class="el-icon-search"  @click.stop="newChangeImgFile(item)"></i>-->
            <!--<i class="el-icon-delete"  @click.stop="deleteScene(item,index)"></i>-->
            <!--</span>-->
            <!--</span>-->
            <!--</div>-->
            <!--<div v-if="expandicon===item.label">-->
            <!--&lt;!&ndash;子节点内容&ndash;&gt;-->
            <!--<div class="el-tree-node__children"  style="display: block;">-->
            <!--&lt;!&ndash;每个子节点内容&ndash;&gt;-->
            <!--<div class="el-tree-node" v-for="(child,childindex) in Tree[index].children">-->
            <!--<div class="el-tree-node__content" style="padding-left: 16px;">-->

            <!--<span @click.stop="expand1">-->
            <!--<span v-if="expandicon1===child.label" class="el-tree-node__expand-icon expanded"></span>-->
            <!--<span v-else class="el-tree-node__expand-icon"></span>-->
            <!--</span>-->

            <!--<span class="custom-tree-node">-->
            <!--&lt;!&ndash;热点类型信息&ndash;&gt;-->
            <!--<span>{{child.label}}</span>-->
            <!--<span>-->
            <!--<i class="el-icon-plus" @click.stop=""></i>-->
            <!--</span>-->
            <!--</span>-->
            <!--</div>-->

            <!--<div v-if="expandicon1===child.label">-->
            <!--<div class="el-tree-node__children" style="display: block;">-->
            <!--<div class="el-tree-node" v-for="(child1,index1) in child.children">-->
            <!--<div class="el-tree-node__content" style="padding-left: 32px;" @click.stop="activeHotSpot(child1)">-->

            <!--<span @click.stop="expand2">-->
            <!--<span v-if="expandicon2===child1.label" class="el-tree-node__expand-icon expanded"></span>-->
            <!--<span v-else class="el-tree-node__expand-icon"></span>-->
            <!--</span>-->

            <!--<span class="custom-tree-node">-->
            <!--&lt;!&ndash;对应热点类型下的热点&ndash;&gt;-->
            <!--<span>{{child1.label}}</span>-->
            <!--<span>-->
            <!--<i class="el-icon-delete" @click.stop="newDeleteHotSpot(child1,index1)"></i>-->
            <!--</span>-->
            <!--</span>-->
            <!--</div>-->
            <!--<div>-->

            <!--<div v-if="expandicon2===child1.label">-->
            <!--<div class="el-tree-node__children" style="display: block;">-->
            <!--<div class="el-tree-node" v-for="child2 in child1.children">-->
            <!--<div class="el-tree-node__content" style="padding-left: 48px;">-->
            <!--<span class="el-tree-node__expand-icon is-leaf"></span>-->
            <!--<span class="custom-tree-node">-->
            <!--<span v-show="child2.pid===4">-->
            <!--跳转场景：-->
            <!--<template>-->
            <!--<select @change="saveTreeJumpScene(child2)"  v-model="child2.label">-->
            <!--<option disabled value="">{{child2.label}}</option>-->
            <!--<option v-for="targetItem in targetOptions" :value="targetItem.value" >-->
            <!--{{targetItem.value}}-->
            <!--</option>-->
            <!--</select>-->
            <!--</template>-->
            <!--</span>-->
            <!--<span v-show="child2.pid===5">-->
            <!--热点说明：<input v-bind:value="child2.label" ref="input1"-->
            <!--@blur.prevent="saveTreeHotIntroduction(child2)"/>-->
            <!--</span>-->
            <!--<span v-show="child2.pid===6">-->
            <!--已上传图片：-->
            <!--<template>-->
            <!--<select v-model="child2.label" @change="saveTreeUploadPicture(child2)">-->
            <!--<option disabled value="">{{child2.label}}</option>-->
            <!--<option v-for="item in hotSpotsImgs" :value="item.value">-->
            <!--{{item.value}}-->
            <!--</option>-->
            <!--</select>-->
            <!--</template>-->
            <!--</span>-->
            <!--<span v-show="child2.pid===7">-->
            <!--跳转链接：<input v-bind:value="child2.label" ref="input2" @blur.prevent="saveTreeHotUrl(child2)"/>-->
            <!--</span>-->
            <!--</span>-->
            <!--</div>-->
            <!--<div class="el-tree-node__children" style="display: none;"></div>-->
            <!--</div>-->
            <!--</div>-->
            <!--</div>-->

            <!--<div v-else>-->
            <!--<div class="el-tree-node__children"  style="display: none;"></div>-->
            <!--</div>-->

            <!--</div>-->
            <!--</div>-->
            <!--</div>-->
            <!--</div>-->

            <!--<div v-else>-->
            <!--<div class="el-tree-node__children"  style="display: none;"></div>-->
            <!--</div>-->

            <!--</div>-->
            <!--</div>-->

            <!--</div>-->

            <!--<div v-else>-->
            <!--<div class="el-tree-node__children"  style="display: none;"></div>-->
            <!--</div>-->

            <!--</div>-->
            <!--</div>-->
            <!--</div>-->

            <!--<el-form label-position="left" label-width="100px">-->
            <!--&lt;!&ndash;在场景预览中每个图片上绑定事件，点击图片获取图片的src,将src传到state.imgFile中。&ndash;&gt;-->
            <!--<div class="sideItem">-->
            <!--<div class="sidetitle">场景预览:</div>-->
            <!--<el-form label-position="left" label-width="150px">-->
            <!--<div class="sideItem">-->
            <!--<ul style="padding: 0">-->
            <!--<li v-for="item in fileUrlArr" @click="changeImgFile">-->
            <!--<img v-bind:src=item.fileUrl  v-bind:title=item.fileName width="270px" height="135px">-->
            <!--</li>-->
            <!--</ul>-->
            <!--</div>-->
            <!--</el-form>-->
            <!--</div>-->
            <!--</el-form>-->

            <!--</el-tab-pane>-->
          </div>


          <el-form label-position="left" label-width="100px">
            <div class="sideItem">
              <div v-show="this.$store.state.test.isImgHotSpot">
                <div class="sidetitle">热点类型:</div>
                <el-form-item label="热点类型">
                  <!--<div v-show=""></div>-->
                  <el-select size="small" v-model="value" clearable @change="saveSelectHotType(value)"
                             :placeholder="hotSpotsType?hotSpotsType:'请选择热点类型'">
                    <el-option
                      v-for="item in hotSpotsTypes"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>

                </el-form-item>
                <div v-show="this.hotSpotsType==='URL热点'">
                  <el-form-item label="跳转链接">
                    <el-input v-bind:value="hotUrl" ref="input4" clearable @blur.prevent="saveInputHotUrl()"
                              placeholder="确认后点击确定"></el-input>
                    <!--<el-input placeholder="确认后点击确定" v-model='hotUrl' size="small"></el-input>-->
                  </el-form-item>
                  <div style="text-align:center">
                    <el-button type="primary" @click="saveUrlHotSpot">确定</el-button>
                  </div>
                </div>
                <div v-show="this.hotSpotsType==='图像热点'">
                  <el-form-item label="已上传图片">

                    <el-select size="small" v-model="value1" clearable @change="saveSelectUploadPicture(value1)"
                               :placeholder="hotSpotsImg?hotSpotsImg:'请选择已上传图片'">
                      <el-option
                        v-for="item in this.$store.state.test.hotSpotsImgs"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>

                  </el-form-item>
                  <el-form-item label="图片上传">
                    <el-upload
                      class="upload-panorama1"
                      v-bind:action=ajaxUrl2
                      :on-remove="imgHandleRemove"
                      :before-remove="beforeRemove"
                      :onError="uploadError"
                      :onSuccess="imgUploadSuccess">
                      <el-button size="small" type="primary">请上传热点图片</el-button>
                    </el-upload>
                  </el-form-item>
                  <div style="text-align:center">
                    <el-button type="primary" @click="saveImageHotSpot">确定</el-button>
                  </div>
                </div>
              </div>
              <div v-show="this.$store.state.test.isJumpHotSpot">
                <div class="sidetitle">跳转热点:</div>
                <el-form-item label="目标场景">

                  <el-select size="small" v-model="value2" clearable @change="saveSelectJumpScene(value2)"
                             :placeholder="hotTarget?hotTarget:'请选择要跳转的场景'">
                    <el-option
                      v-for="item in targetOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>

                </el-form-item>
                <el-form-item label="场景说明">
                  <el-input v-bind:value="hotIntroduction" ref="input3" clearable @blur.prevent="saveInputHotIntroduction()"
                            placeholder="确认后点击确定"></el-input>
                  <!--<el-input placeholder="确认后点击确定" v-model='hotIntroduction' size="small"></el-input>-->
                </el-form-item>
                <div style="text-align:center">
                  <el-button type="primary" @click="saveJumpHotSpot">确定</el-button>
                </div>
              </div>

              <div v-show="this.$store.state.test.isVideoHotSpot">

                <div class="sidetitle">热点类型:</div>
                <el-form-item label="上传视频类型">
                  <el-select size="small" v-model="value" clearable @change="saveSelectHotType(value)"
                             :placeholder="hotSpotsType?hotSpotsType:'请选择视频类型'">
                    <el-option
                      v-for="item in hotSpotsTypes"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>

                <div class="transfrom">
                  <label>水平平移：</label>
                  <!--<input type="text" v-model="VideoTransformX" id="txtNumberX"/>-->
                  <!--<input type="button" value="▲" class="up" @click.stop="addTransformX()" />-->
                  <!--<input class="down" type="button" @click.stop="removeTransformX()" value="▼" />-->

                  <!--<select :value="value" @input="value = $event.target.value" id="txtNumberX">-->

                  <!--<select v-model="valueX" id="txtNumberX">-->
                    <!--<option  v-for="item in optionsX"-->
                             <!--:key="item.value"-->
                             <!--:label="item.label"-->
                             <!--:value="item.value"></option>-->
                  <!--</select>-->
                  <el-select v-model="valueX" @change="selectGetX(valueX)" placeholder="请选择" id="txtNumberX">
                    <el-option
                      v-for="item in optionsX"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                  <i class="el-icon-arrow-up up"  @click.stop="addTransformX()"></i>
                  <i class="el-icon-arrow-down down"  @click.stop="removeTransformX()"></i>
                </div>
                <div class="transfrom">
                  <label>竖直平移：</label>
                  <el-select v-model="valueY" @change="selectGetY(valueY)" placeholder="请选择" id="txtNumberY">
                    <el-option
                      v-for="item in optionsY"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                  <i class="el-icon-arrow-up up"  @click.stop="addTransformY()"></i>
                  <i class="el-icon-arrow-down down"  @click.stop="removeTransformY()"></i>
                </div>
                <div class="transfrom">
                  <label>旋转：</label>
                  <el-select v-model="valueR" @change="selectGetR(valueR)" placeholder="请选择" id="txtNumberRR">
                    <el-option
                      v-for="item in optionsR"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                  <i class="el-icon-arrow-up up"  @click.stop="addRotate()"></i>
                  <i class="el-icon-arrow-down down"  @click.stop="removeRotate()"></i>
                </div>
                <div class="transfrom">
                  <label>放缩：</label>
                  <el-select v-model="valueS" @change="selectGetS(valueS)" placeholder="请选择" id="txtNumberSS">
                    <el-option
                      v-for="item in optionsS"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                  <i class="el-icon-arrow-up up"  @click.stop="addScale()"></i>
                  <i class="el-icon-arrow-down down"  @click.stop="removeScale()"></i>
                </div>
                <div class="transfrom">
                  <label>旋转角度：</label>
                  <input type="text" v-model="VideoRotate" id="txtNumberR" :disabled="true"/>
                </div>
                <div class="transfrom">
                  <label>放缩倍数：</label>
                  <input type="text" v-model="VideoScale" id="txtNumberS" :disabled="true"/>
                </div>


                <div v-show="this.hotSpotsType==='URL热点'">
                  <el-form-item label="视频链接">
                    <el-input v-bind:value="hotUrl" ref="input4" clearable @blur.prevent="saveInputHotUrl()"
                              placeholder="确认后点击确定"></el-input>
                    <!--<el-input placeholder="确认后点击确定" v-model='hotUrl' size="small"></el-input>-->
                  </el-form-item>
                  <div style="text-align:center">
                    <el-button type="primary" @click="saveUrlHotSpot">确定</el-button>
                  </div>
                </div>
                <div v-show="this.hotSpotsType==='图像热点'">
                  <el-form-item label="本地视频">

                    <el-select size="small" v-model="value1" clearable @change="saveSelectUploadPicture(value1)"
                               :placeholder="hotSpotsImg?hotSpotsImg:'请选择已上传视频'">
                      <el-option
                        v-for="item in this.$store.state.test.hotSpotsImgs"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>

                  </el-form-item>
                  <el-form-item label="视频上传">
                    <el-upload
                      class="upload-panorama1"
                      v-bind:action=ajaxUrl2
                      :on-remove="imgHandleRemove"
                      :before-remove="beforeRemove"
                      :onError="uploadError"
                      :onSuccess="imgUploadSuccess">
                      <el-button size="small" type="primary">请上传相关视频</el-button>
                    </el-upload>
                  </el-form-item>
                  <div style="text-align:center">
                    <el-button type="primary" @click="">确定</el-button>
                  </div>
                </div>
              </div>

            </div>
          </el-form>

          <div class="tree">
            <div class="el-tree">
              <div class="el-tree-node" v-for="(item,index) in Tree">
                <!--节点内容-->
                <div class="el-tree-node__content" style="padding-left: 0px;">

                      <span @click.stop="expand">
                        <span v-if="expandicon===item.label" class="el-tree-node__expand-icon expanded"></span>
                        <span v-else class="el-tree-node__expand-icon "></span>
                      </span>

                  <span class="custom-tree-node">
                        <!--场景信息-->
                      <span>{{item.label}}</span>
                      <span>
                          <!--添加按钮-->
                          <i class="el-icon-search"  @click.stop="newChangeImgFile(item)"></i>
                          <i class="el-icon-delete"  @click.stop="deleteScene(item,index)"></i>
                      </span>
                    </span>
                </div>
                <div v-if="expandicon===item.label">
                  <!--子节点内容-->
                  <div class="el-tree-node__children"  style="display: block;">
                    <!--每个子节点内容-->
                    <div class="el-tree-node" v-for="(child,childindex) in Tree[index].children">
                      <div class="el-tree-node__content" style="padding-left: 16px;">

                          <span @click.stop="expand1">
                            <span v-if="expandicon1===child.label" class="el-tree-node__expand-icon expanded"></span>
                            <span v-else class="el-tree-node__expand-icon"></span>
                          </span>

                        <span class="custom-tree-node">
                            <!--热点类型信息-->
                          <span>{{child.label}}</span>
                            <span>
                              <i class="el-icon-plus" @click.stop="drawHotspot(child)"></i>
                            </span>
                          </span>
                      </div>

                      <div v-if="expandicon1===child.label">
                        <div class="el-tree-node__children" style="display: block;">
                          <div class="el-tree-node" v-for="(child1,index1) in child.children">
                            <div class="el-tree-node__content" style="padding-left: 32px;" @click.stop="activeHotSpot(child1)">

                              <span @click.stop="expand2">
                                <span v-if="expandicon2===child1.label" class="el-tree-node__expand-icon expanded"></span>
                                <span v-else class="el-tree-node__expand-icon"></span>
                              </span>

                              <span class="custom-tree-node">
                                <!--对应热点类型下的热点-->
                                <span>{{child1.label}}</span>
                                  <span>
                                    <i class="el-icon-delete" @click.stop="newDeleteHotSpot(child1,index1)"></i>
                                  </span>
                              </span>
                            </div>
                            <div>

                              <div v-if="expandicon2===child1.label">
                                <div class="el-tree-node__children" style="display: block;">
                                  <div class="el-tree-node" v-for="child2 in child1.children">
                                    <div class="el-tree-node__content" style="padding-left: 48px;">
                                      <span class="el-tree-node__expand-icon is-leaf"></span>
                                      <span class="custom-tree-node">
                                  <span v-show="child2.pid===4">
                                        跳转场景：
                                        <template>
                                          <select @change="saveTreeJumpScene(child2)"  v-model="child2.label">
                                           <option disabled value="">{{child2.label}}</option>
                                           <option v-for="targetItem in targetOptions" :value="targetItem.value" >
                                             {{targetItem.value}}
                                           </option>
                                          </select>
                                        </template>
                                  </span>
                                  <span v-show="child2.pid===5">
                                    热点说明：<input v-bind:value="child2.label" ref="input1"
                                                @blur.prevent="saveTreeHotIntroduction(child2)"/>
                                  </span>
                                  <span v-show="child2.pid===6">
                                        已上传图片：
                                        <template>
                                        <select v-model="child2.label" @change="saveTreeUploadPicture(child2)">
                                        <option disabled value="">{{child2.label}}</option>
                                        <option v-for="item in hotSpotsImgs" :value="item.value">
                                          {{item.value}}
                                        </option>
                                        </select>
                                        </template>
                                 </span>
                                  <span v-show="child2.pid===7">
                                    跳转链接：<input v-bind:value="child2.label" ref="input2" @blur.prevent="saveTreeHotUrl(child2)"/>
                                  </span>
                                  </span>
                                    </div>
                                    <div class="el-tree-node__children" style="display: none;"></div>
                                  </div>
                                </div>
                              </div>

                              <div v-else>
                                <div class="el-tree-node__children"  style="display: none;"></div>
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-else>
                        <div class="el-tree-node__children"  style="display: none;"></div>
                      </div>

                    </div>
                  </div>

                </div>

                <div v-else>
                  <div class="el-tree-node__children"  style="display: none;"></div>
                </div>

              </div>
            </div>
          </div>

          <el-form label-position="left" label-width="100px">
            <!--在场景预览中每个图片上绑定事件，点击图片获取图片的src,将src传到state.imgFile中。-->
            <div class="sideItem">
              <div class="sidetitle">场景预览:</div>
              <el-form label-position="left" label-width="150px">
                <div class="sideItem">
                  <ul style="padding: 0">
                    <img v-bind:src="imgFile.fileUrl"  v-bind:title="imgFile.fileName" width="270px" height="135px">
                  </ul>
                </div>
              </el-form>
            </div>
          </el-form>


          <div>
            <!--<el-tab-pane label="用户数据" name="user">-->
            <!--<el-form label-position="left" label-width="100px">-->
            <!--<div class="sideItem">-->
            <!--<el-form-item label="Title">-->
            <!--<el-input size="small"></el-input>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="Description">-->
            <!--<el-input size="small"></el-input>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="Author">-->
            <!--<el-input size="small"></el-input>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="Date">-->
            <!--<el-date-picker-->
            <!--align="left"-->
            <!--v-model="dateVal" type="date"-->
            <!--size="small" placeholder="选择日期" :picker-options="pickerOptions0">-->
            <!--</el-date-picker>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="Corpright">-->
            <!--<el-input size="small"></el-input>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="Source">-->
            <!--<el-input size="small"></el-input>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="Information">-->
            <!--<el-input size="small"></el-input>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="Comment">-->
            <!--<el-input size="small"></el-input>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="Latitude">-->
            <!--<el-input size="small"></el-input>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="Longitude">-->
            <!--<el-input size="small"></el-input>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="Tags">-->
            <!--<el-input size="small"></el-input>-->
            <!--</el-form-item>-->
            <!--</div>-->
            <!--</el-form>-->
            <!--</el-tab-pane>-->
          </div>

        </el-tabs>
    </el-menu>
</template>

<script>
    import { mapGetters } from 'vuex';
    import SidebarItem from './SidebarItem';
    export default {
      components: { SidebarItem },
      computed: {
        ...mapGetters([
          'permission_routers'
        ]),
        //平移，旋转，放缩的倍率框
        // valueX:{
        //   get () {
        //     return this.$store.state.test.valueX
        //   },
        //   set (valueX) {
        //     this.$store.commit('updateValueX', valueX)
        //   }
        // },
        // valueY:{
        //   get () {
        //     return this.$store.state.test.valueY
        //   },
        //   set (valueX) {
        //     this.$store.commit('updateValueY', valueY)
        //   }
        // },
        // valueR:{
        //   get () {
        //     return this.$store.state.test.valueR
        //   },
        //   set (valueX) {
        //     this.$store.commit('updateValueR', valueR)
        //   }
        // },
        // valueS:{
        //   get () {
        //     return this.$store.state.test.valueS
        //   },
        //   set (valueX) {
        //     this.$store.commit('updateValueS', valueS)
        //   }
        // },
        // VideoTransformX:{
        //   get(){
        //     if(Object.keys(this.$store.state.test.oldselected).length !== 0){
        //       return this.$store.state.test.oldselected.client[0];
        //     }
        //     return '';
        //   }
        // },
        // VideoTransformY:{
        //   get(){
        //     if(Object.keys(this.$store.state.test.oldselected).length !== 0){
        //       return this.$store.state.test.oldselected.client[1];
        //     }
        //     return '';
        //   }
        // },
        VideoRotate:{
          get(){
            return this.$store.state.test.videoRotate+"°";
          }
        },
        VideoScale:{
          get(){
            return this.$store.state.test.videoScale;
          }
        },

        //获得当前场景
        Scene:{
          get(){
            for(let i = 0 ;i < this.$store.state.test.fileUrlArr.length ; i++){
              if(this.$store.state.test.imgFile.fileName===this.$store.state.test.fileUrlArr[i].fileName){
                return i;
              }
            }
            return -1;
          },
          set(){}
        },
        //获得点击的热点的tempLocation
        TempLocation:{
          get(){
            return this.$store.state.test.tempLocation;
          },
        },
        //获得state里面的imgFIle
        imgFile:{
          get(){
            return this.$store.state.test.imgFile;
          }
        },
        Tree:{
          get(){
            //获得xml字符串中所有场景热点信息并存储为树形结构
            let  tree = [];
            for (let i = 0; i <this.$store.state.test.arr.length; i++) {
              let  newobj = {
                label:"",
                children:[],
              };
              let newobj2 = {
                label:"跳转热点",
                children:[],
              };
              let newobj3 = {
                children:[]
              };

              let  len = this.$store.state.test.arr[i].hotspot.length;
              newobj.label="场景"+(i+1);
              newobj.pid=1;
              for (let j = 0; j <len ; j++) {

                newobj3 = {
                  children:[]
                };

                let obj={};
                obj.label=this.$store.state.test.arr[i].hotspot[j].url.replace("{","").replace("}","").replace('node', "场景");
                //不同的热点参数给不同的pid来判断是哪个热点参数
                obj.pid=4;
                obj.children=[];
                newobj3.children.push(obj);

                obj.position=this.$store.state.test.arr[i].hotspot[j].position;

                obj={};
                obj.label=this.$store.state.test.arr[i].hotspot[j].title.replace("{","").replace("}","");
                obj.pid=5;
                obj.children=[];
                newobj3.children.push(obj);

                newobj3.label="跳转热点"+(j+1);
                newobj3.pid=3;

                newobj2.children.push(newobj3);
              }

              newobj2.pid=2;
              newobj.children.push(newobj2);

              newobj2 = {
                label:"图像热点",
                children:[],
              };

              let len2 = this.$store.state.test.arr[i].polyhotspot.imageHotSpots.length;
              for (let j = 0; j < len2; j++) {

                newobj3 = {
                  children:[]
                };


                let obj={};
                let reg2 = /([^/]+)$/;
                obj.label=this.$store.state.test.arr[i].polyhotspot.imageHotSpots[j].target.match(reg2)[1];
                obj.pid=6;
                obj.children=[];
                newobj3.children.push(obj);

                obj.position=this.$store.state.test.arr[i].polyhotspot.imageHotSpots[j].position;
                obj.panAndTilt=this.$store.state.test.arr[i].polyhotspot.imageHotSpots[j].panAndTilt;

                newobj3.label="图像热点"+(j+1);
                newobj3.pid=3;
                newobj2.children.push(newobj3);
              }

              newobj2.pid=2;
              newobj.children.push(newobj2);


              newobj2 = {
                label:"URL热点",
                children:[],
              };

              let len3 = this.$store.state.test.arr[i].polyhotspot.urlHotSpots.length;
              for (let j = 0; j < len3; j++) {

                newobj3 = {
                  children:[]
                };

                let obj={};
                let reg2 = /([^/]+)$/;
                obj.label=this.$store.state.test.arr[i].polyhotspot.urlHotSpots[j].url.match(reg2)[1];
                obj.pid=7;
                obj.children=[];
                newobj3.children.push(obj);

                obj.position=this.$store.state.test.arr[i].polyhotspot.urlHotSpots[j].position;
                obj.panAndTilt=this.$store.state.test.arr[i].polyhotspot.urlHotSpots[j].panAndTilt;


                newobj3.label="URL热点"+(j+1);
                newobj3.pid=3;
                newobj2.children.push(newobj3);

              }
              newobj2.pid=2;
              newobj.children.push(newobj2);

              tree.push(newobj);
            }

            //根据数据的树状结构给每个层次赋予id值
            let num = 0;
            for (let i = 0; i <tree.length; i++) {
              tree[i].id=(++num);
            }
            for (let i = 0; i <tree.length; i++) {
              for (let j = 0; j <tree[i].children.length ; j++) {
                tree[i].children[j].id=(++num);
              }
            }
            for (let i = 0; i <tree.length; i++) {
              for (let j = 0; j <tree[i].children.length ; j++) {
                for (let k = 0; k <tree[i].children[j].children.length ; k++) {
                  tree[i].children[j].children[k].id=(++num);
                }
              }
            }
            for (let i = 0; i <tree.length; i++) {
              for (let j = 0; j <tree[i].children.length ; j++) {
                for (let k = 0; k <tree[i].children[j].children.length ; k++) {
                  for (let l = 0; l <tree[i].children[j].children[k].children.length ; l++) {
                    tree[i].children[j].children[k].children[l].id=(++num);
                  }
                }
              }
            }

            this.$store.commit('addMaxID', num);
            return JSON.parse(JSON.stringify(tree));
            // return JSON.parse(JSON.stringify(this.$store.state.test.tree));
          },
        },
        fileName:{
            get(){
                return this.$store.state.test.imgFile.fileName;
            }
          },
        //实现了双向绑定计算属性
        imgType:{
              get(){
                  return this.$store.state.test.imgType;
              },
              set(value){
                  this.$store.commit('saveimgType',value);
              }
          },
        hotIntroduction:{
          get(){

            if(Object.keys(this.$store.state.test.tempLocation).length !== 0){
              for (let i = 0; i < this.$store.state.test.jumpHotSpots.length ; i++) {
                if(Math.round(this.$store.state.test.jumpHotSpots[i].position[0])===Math.round(this.$store.state.test.tempLocation.location[0])&&Math.round(this.$store.state.test.jumpHotSpots[i].position[1])===Math.round(this.$store.state.test.tempLocation.location[1])&&Math.round(this.$store.state.test.jumpHotSpots[i].position[2])===Math.round(this.$store.state.test.tempLocation.location[2])){
                  return this.$store.state.test.jumpHotSpots[i].hotIntroduction;
                }
              }
              return '';
            }else{
              return '';
            }
          },
          set(){}
        },
        hotTarget:{
          get(){
            if (Object.keys(this.$store.state.test.tempLocation).length !== 0) {
            for (let i = 0; i < this.$store.state.test.jumpHotSpots.length ; i++) {
              if (Math.round(this.$store.state.test.jumpHotSpots[i].position[0])===Math.round(this.$store.state.test.tempLocation.location[0])&&Math.round(this.$store.state.test.jumpHotSpots[i].position[1])===Math.round(this.$store.state.test.tempLocation.location[1])&&Math.round(this.$store.state.test.jumpHotSpots[i].position[2])===Math.round(this.$store.state.test.tempLocation.location[2])) {
                return this.$store.state.test.jumpHotSpots[i].hotTarget;
                }
              }
              return '';
            }else{
              return '';
            }
          },
          set(){}
        },
        hotSpotsType:{
          get(){
            //获取state中所有的热点，并判断是否是state中的热点
            let hotSpotsType = "";
            if (this.$store.state.test.selectHotType){
              return this.$store.state.test.selectHotType;
            } else if (Object.keys(this.$store.state.test.tempLocation).length !== 0) {
              for (let i = 0; i < this.$store.state.test.urlHotSpots.length; i++) {
                if (Math.round(this.$store.state.test.urlHotSpots[i].position[0].x) === Math.round(this.$store.state.test.tempLocation.location[0].x) ) {
                  if (Math.round(this.$store.state.test.urlHotSpots[i].position[1].x) === Math.round(this.$store.state.test.tempLocation.location[1].x) ) {
                    if (Math.round(this.$store.state.test.urlHotSpots[i].position[2].x) === Math.round(this.$store.state.test.tempLocation.location[2].x) ) {
                      if (Math.round(this.$store.state.test.urlHotSpots[i].position[3].x) === Math.round(this.$store.state.test.tempLocation.location[3].x) ) {
                        hotSpotsType = 'URL热点';
                        return hotSpotsType;
                      }
                    }
                  }
                }
              }
              for (let i = 0; i < this.$store.state.test.imageHotSpots.length; i++) {
                if (Math.round(this.$store.state.test.imageHotSpots[i].position[0].x) === Math.round(this.$store.state.test.tempLocation.location[0].x) ) {
                  if (Math.round(this.$store.state.test.imageHotSpots[i].position[1].x) === Math.round(this.$store.state.test.tempLocation.location[1].x) ) {
                    if (Math.round(this.$store.state.test.imageHotSpots[i].position[2].x) === Math.round(this.$store.state.test.tempLocation.location[2].x) ) {
                      if (Math.round(this.$store.state.test.imageHotSpots[i].position[3].x) === Math.round(this.$store.state.test.tempLocation.location[3].x) ) {
                        hotSpotsType = '图像热点';
                        return hotSpotsType;
                      }
                    }
                  }
                }
              }
            } else{
              return '';
            }

          },
          set(){}
        },
        hotUrl:{
          get: function () {

            if (Object.keys(this.$store.state.test.tempLocation).length !== 0) {
              for (let i = 0; i < this.$store.state.test.urlHotSpots.length; i++) {
                if (Math.round(this.$store.state.test.urlHotSpots[i].position[0].x) === Math.round(this.$store.state.test.tempLocation.location[0].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[0].y) === Math.round(this.$store.state.test.tempLocation.location[0].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[0].z) === Math.round(this.$store.state.test.tempLocation.location[0].z)) {
                  if (Math.round(this.$store.state.test.urlHotSpots[i].position[1].x) === Math.round(this.$store.state.test.tempLocation.location[1].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[1].y) === Math.round(this.$store.state.test.tempLocation.location[1].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[1].z) === Math.round(this.$store.state.test.tempLocation.location[1].z)) {
                    if (Math.round(this.$store.state.test.urlHotSpots[i].position[2].x) === Math.round(this.$store.state.test.tempLocation.location[2].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[2].y) === Math.round(this.$store.state.test.tempLocation.location[2].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[2].z) === Math.round(this.$store.state.test.tempLocation.location[2].z)) {
                      if (Math.round(this.$store.state.test.urlHotSpots[i].position[3].x) === Math.round(this.$store.state.test.tempLocation.location[3].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[3].y) === Math.round(this.$store.state.test.tempLocation.location[3].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[3].z) === Math.round(this.$store.state.test.tempLocation.location[3].z)) {
                        return this.$store.state.test.urlHotSpots[i] ? this.$store.state.test.urlHotSpots[i].hotUrl : '';
                      }
                    }
                  }
                }
              }
              return '';
            } else {
              return '';
            }
          },
          set(){}
        },
        hotSpotsImg:{
          get(){
            if (Object.keys(this.$store.state.test.tempLocation).length !== 0) {
              for (let i = 0; i < this.$store.state.test.imageHotSpots.length; i++) {
                if (Math.round(this.$store.state.test.imageHotSpots[i].position[0].x) === Math.round(this.$store.state.test.tempLocation.location[0].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[0].y) === Math.round(this.$store.state.test.tempLocation.location[0].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[0].z) === Math.round(this.$store.state.test.tempLocation.location[0].z)) {
                  if (Math.round(this.$store.state.test.imageHotSpots[i].position[1].x) === Math.round(this.$store.state.test.tempLocation.location[1].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[1].y) === Math.round(this.$store.state.test.tempLocation.location[1].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[1].z) === Math.round(this.$store.state.test.tempLocation.location[1].z)) {
                    if (Math.round(this.$store.state.test.imageHotSpots[i].position[2].x) === Math.round(this.$store.state.test.tempLocation.location[2].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[2].y) === Math.round(this.$store.state.test.tempLocation.location[2].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[2].z) === Math.round(this.$store.state.test.tempLocation.location[2].z)) {
                      if (Math.round(this.$store.state.test.imageHotSpots[i].position[3].x) === Math.round(this.$store.state.test.tempLocation.location[3].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[3].y) === Math.round(this.$store.state.test.tempLocation.location[3].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[3].z) === Math.round(this.$store.state.test.tempLocation.location[3].z)) {
                        return this.$store.state.test.imageHotSpots[i]?this.$store.state.test.imageHotSpots[i].hotImage:'';
                      }
                    }
                  }
                }
              }
              return '';
            }else{
              return '';
            }
          },
          set(){}
        },
        // endAction:{
        //     get(){
        //         return this.$store.state.test.endAction;
        //     },
        //     set(value){
        //         this.$store.commit('saveendAction',value);
        //     }
        // },
        // level:{
        //     get(){
        //         return this.$store.state.test.level;
        //     },
        //     set(value){
        //         this.$store.commit('savelevel',value);
        //     }
        // },
        // loop:{
        //     get(){
        //         return this.$store.state.test.loop;
        //     },
        //     set(value){
        //         this.$store.commit('saveloop',value);
        //     }
        // },
        // pitch:{
        //     get(){
        //         return this.$store.state.test.pitch;
        //     },
        //     set(value){
        //         this.$store.commit('savepitch',value);
        //     }
        // },
        // roll:{
        //     get(){
        //         return this.$store.state.test.roll;
        //     },
        //     set(value){
        //         this.$store.commit('saveroll',value);
        //     }
        // },
        // pan:{
        //     get(){
        //         return this.$store.state.test.pan;
        //     },
        //     set(value){
        //         this.$store.commit('savepan',value);
        //     }
        // },
        // tilt:{
        //     get(){
        //         return this.$store.state.test.tilt;
        //     },
        //     set(value){
        //         this.$store.commit('savetilt',value);
        //     }
        // },
        // fov:{
        //     get(){
        //         return this.$store.state.test.fov;
        //     },
        //     set(value){
        //         this.$store.commit('savefov',value);
        //     }
        // },
        // min:{
        //     get(){
        //         return this.$store.state.test.min;
        //     },
        //     set(value){
        //         this.$store.commit('savemin',value);
        //     }
        // },
        // max:{
        //     get(){
        //         return this.$store.state.test.max;
        //     },
        //     set(value){
        //         this.$store.commit('savemax',value);
        //     }
        // },
        // pannorth:{
        //     get(){
        //         return this.$store.state.test.pannorth;
        //     },
        //     set(value){
        //         this.$store.commit('savepannorth',value);
        //     }
        // },
        // external:{
        //     get(){
        //         return this.$store.state.test.external;
        //     },
        //     set(value){
        //         this.$store.commit('saveexternal',value);
        //     }
        // },
        // minFov:{
        //     get(){
        //         return this.$store.state.test.minFov;
        //     },
        //     set(value){
        //         this.$store.commit('saveminFov',value);
        //     }
        // },
        // showLimits:{
        //     get(){
        //         return this.$store.state.test.showLimits;
        //     },
        //     set(value){
        //         this.$store.commit('saveshowLimits',value);
        //     }
        // },
        //暂时用不到
        dateVal:{
            get(){
                return this.$store.state.test.dateVal;
            },
            set(value){
                this.$store.commit('savedateVal',value);
            }
        },
        fileUrlArr:{
          get(){
              return this.$store.state.test.fileUrlArr;
          }
        },
        //根据文件上传的数量来生成target的数目
        targetOptions:{
          get(){
              let targetOptions=[{'value':'无','label':'无'}];
              let fileSum=this.$store.state.test.fileUrlArr.length;
              for(let i=0;i<fileSum;i++){
                  let o={};
                  o.value='场景'+(i+1);
                  o.label='场景'+(i+1);
                  targetOptions.push(o);
              }
              return targetOptions;
          }
        },
        //显示哪一列
        // activeName:{
        //   get(){
        //       let activeName=this.$store.state.test.activeName;
        //       return activeName
        //   },
        //   set(){
        //
        //   }
        //
        // },
        //上传全景照片的url
        ajaxUrl1:{
          get(){
              let ajaxUrl1=this.$store.state.test.panoUploadUrl;
              return ajaxUrl1+'?_token='+this.token+'&user='+this.createUserNo+'&summary=1';
          }
        },
        ajaxUrl2:{
          get(){
              //这里上传贴图和上传全景图前面的路径相同，只是根据summary来判断
              let ajaxUrl2=this.$store.state.test.panoUploadUrl;
              return ajaxUrl2+'?_token='+this.token+'&user='+this.createUserNo+'&summary=2';
          }
        }

      },
      watch: {
        //若点击其他热点则清空select选择框中的值
        TempLocation: function () {
          this.value = '';
          this.value1 = '';
          this.value2 = '';
        }
      },
      methods:{
        //下拉框选中事件
        selectGetX: function(value){
          this.Xvalue = value;
        },
        selectGetY: function(value){
          this.Yvalue = value;
        },
        selectGetR: function(value){
          this.Rvalue = value;
        },
        selectGetS: function(value){
          this.Svalue = value;
        },
        //视频热点X轴方向的平移操作
        addTransformX: function(){
          console.log(this.Xvalue);
          this.$store.commit('changeOldSelectedX',this.Xvalue);
          // showControl.value = parseInt(showControl.value) + 1;
          // this.$store.commit('changeOldSelectedX',showControl.value);
        },
        removeTransformX: function(){
          this.$store.commit('changeOldSelectedX',this.Xvalue*(-1));
          // let showControl = document.getElementById("txtNumberX");
          // showControl.value = parseInt(showControl.value) - 1;
          // this.$store.commit('changeOldSelectedX',showControl.value);
        },
        //视频热点Y轴方向的平移操作
        addTransformY: function(){
          this.$store.commit('changeOldSelectedY',this.Yvalue*(-1));
          // let showControl = document.getElementById("txtNumberY");
          // showControl.value = parseInt(showControl.value) + 1;
          // this.$store.commit('changeOldSelectedY',showControl.value);
        },
        removeTransformY: function(){
          this.$store.commit('changeOldSelectedY',this.Yvalue);
          // let showControl = document.getElementById("txtNumberY");
          // showControl.value = parseInt(showControl.value) - 1;
          // this.$store.commit('changeOldSelectedY',showControl.value);
        },
        //视频热点的旋转操作
        addRotate: function(){
          this.$store.commit('changeOldSelectedR',this.Rvalue);
          // let showControl = document.getElementById("txtNumberR");
          // showControl.value = parseInt(showControl.value) + 45;
          // this.$store.commit('changeOldSelectedR',showControl.value);
        },
        removeRotate: function(){
          this.$store.commit('changeOldSelectedR',this.Rvalue*(-1));
          // let showControl = document.getElementById("txtNumberR");
          // showControl.value = parseInt(showControl.value) - 45;
          // this.$store.commit('changeOldSelectedR',showControl.value);
        },
        //视频热点的放缩操作
        addScale: function(){
          this.$store.commit('changeOldSelectedS',this.Svalue);
          // let showControl = document.getElementById("txtNumberS");
          // console.log(showControl.value);
          // showControl.value = parseFloat(showControl.value) + 0.1;
          // console.log(showControl.value);
          // this.$store.commit('changeOldSelectedS',Math.round(showControl.value*10)/10);
        },
        removeScale: function(){
          this.$store.commit('changeOldSelectedS',this.Svalue*(-1));
          // let showControl = document.getElementById("txtNumberS");
          // showControl.value = parseFloat(showControl.value) - 0.1;
          // this.$store.commit('changeOldSelectedS',Math.round(showControl.value*10)/10);
        },

        //点击加号按钮则绘制新的热点
        drawHotspot:function(child){
          if(child.label==="跳转热点"){
            this.$store.dispatch('isHotspot');
          }
          if(child.label==="图像热点"||child.label==="URL热点"){
            this.$store.dispatch('isImageHotspot');
          }
        },
        //把树形控件更改的热点说明提交给state的Tree和state里面的热点说明
        saveTreeHotIntroduction:function(child2){
          //获取到输入框中的值
          let result1 = this.$refs.input1[1].value;
          //判断ID的值，若相同则代表获得了Tree中的相应节点
          for (let i = 0; i <this.Tree.length; i++) {
            for (let j = 0; j <this.Tree[i].children.length ; j++) {
              for (let k = 0; k <this.Tree[i].children[j].children.length ; k++) {
                for (let l = 0; l <this.Tree[i].children[j].children[k].children.length ; l++) {
                  if(this.Tree[i].children[j].children[k].children[l].id===child2.id){
                    //把获取到的内容commit到state的Tree中
                    this.$store.commit('saveTreeHotIntroduction',{
                      i:i,
                      j:j,
                      k:k,
                      l:l,
                      result:result1
                    });
                    //更改state里面的热点说明
                    this.$store.commit('savehotIntroduction',{
                      k:k,
                      result:result1
                    });
                    //把修改后的热点变回原来的蓝色热点
                    this.$store.commit('showInactiveJumpSpot');
                  }
                }
              }
            }
          }

        },
        saveTreeHotUrl:function(child2){
          let result2 = this.$refs.input2[0].value;
          //判断ID的值，若相同则代表获得了Tree中的相应节点
          for (let i = 0; i <this.Tree.length; i++) {
            for (let j = 0; j <this.Tree[i].children.length ; j++) {
              for (let k = 0; k <this.Tree[i].children[j].children.length ; k++) {
                for (let l = 0; l <this.Tree[i].children[j].children[k].children.length ; l++) {
                  if(this.Tree[i].children[j].children[k].children[l].id===child2.id){
                    //把获取到的内容commit到state的Tree中
                    this.$store.commit('saveTreeHotUrl',{
                      i:i,
                      j:j,
                      k:k,
                      l:l,
                      result:result2
                    });
                    //更改state里面的热点说明
                    this.$store.commit('savehotUrl',{
                      k:k,
                      result:result2
                    });
                    //把修改后的热点变回原来的Url热点
                    this.$store.commit('showInactiveUrlSpot');
                  }
                }
              }
            }
          }

        },
        saveTreeJumpScene:function(child2){
          let result3 = child2.label;
          //判断ID的值，若相同则代表获得了Tree中的相应节点
          for (let i = 0; i <this.Tree.length; i++) {
            for (let j = 0; j <this.Tree[i].children.length ; j++) {
              for (let k = 0; k <this.Tree[i].children[j].children.length ; k++) {
                for (let l = 0; l <this.Tree[i].children[j].children[k].children.length ; l++) {
                  if(this.Tree[i].children[j].children[k].children[l].id===child2.id){
                    //把获取到的内容commit到state的Tree中
                    this.$store.commit('saveTreeJumpScene',{
                      i:i,
                      j:j,
                      k:k,
                      l:l,
                      result:result3
                    });
                    //更改state里面的热点说明
                    this.$store.commit('savehotTarget',{
                      k:k,
                      result:result3
                    });
                    //把修改后的热点变回原来的蓝色热点
                    this.$store.commit('showInactiveJumpSpot');
                  }
                }
              }
            }
          }
        },
        saveTreeUploadPicture:function(child2){
          let result4 = child2.label;
          //判断ID的值，若相同则代表获得了Tree中的相应节点
          for (let i = 0; i <this.Tree.length; i++) {
            for (let j = 0; j <this.Tree[i].children.length ; j++) {
              for (let k = 0; k <this.Tree[i].children[j].children.length ; k++) {
                for (let l = 0; l <this.Tree[i].children[j].children[k].children.length ; l++) {
                  if(this.Tree[i].children[j].children[k].children[l].id===child2.id){
                    //把获取到的内容commit到state的Tree中
                    this.$store.commit('saveTreeUploadPicture',{
                      i:i,
                      j:j,
                      k:k,
                      l:l,
                      result:result4
                    });
                    //更改state里面的热点说明
                    this.$store.commit('savehotImage',{
                      k:k,
                      result:result4
                    });
                    //把修改后的热点变回原来的图像热点
                    this.$store.commit('showInactiveImageSpot');
                  }
                }
              }
            }
          }
        },
        saveSelectHotType(value){
          this.$store.commit('saveSelectHotType',value);
        },
        saveSelectUploadPicture(value1){
          this.$store.commit('saveSelectUploadPicture',value1);
        },
        saveSelectJumpScene(value2){
          this.$store.commit('saveSelectJumpScene',value2);
        },
        saveInputHotIntroduction(){
          this.$store.commit('saveInputHotIntroduction',this.$refs.input3.$refs.input.value);
        },
        saveInputHotUrl(){
          this.$store.commit('saveInputHotUrl',this.$refs.input4.$refs.input.value);
        },
        //热点管理的热点删除
        newDeleteHotSpot(child1,index1) {
          //把Tree中的热点信息移除
          if(child1.children[0].pid===4){
            this.$store.commit('deleteJumpHotSpot',{scene:this.Scene,index:index1});
          }
          if(child1.children[0].pid===6){
            this.$store.commit('deleteImageHotSpot',{scene:this.Scene,index:index1});
          }
          if(child1.children[0].pid===7){
            this.$store.commit('deleteUrlHotSpot',{scene:this.Scene,index:index1});
          }
          //把场景的热点进行删除
          this.$store.commit('newDeleteHotSpot',{
            position:child1.children[0].position,
            pid:child1.children[0].pid
          });
        },
        //获取点击三角标的事件，从而获得相应的场景信息，并进行比较，判断是否expand(有三个下拉按钮所以分别对应每一个expand)
        expand(e) {
          if(this.expandicon!==e.target.parentNode.parentNode.querySelector(".custom-tree-node span").innerText){
            this.expandicon = e.target.parentNode.parentNode.querySelector(".custom-tree-node span").innerText;
          }else{
            this.expandicon =-1;
          }
        },
        expand1(e){
          if(this.expandicon1!==e.target.parentNode.parentNode.querySelector(".custom-tree-node span").innerText){
            this.expandicon1 = e.target.parentNode.parentNode.querySelector(".custom-tree-node span").innerText;
          }else{
            this.expandicon1 =-1;
          }
        },
        expand2(e){
          if(this.expandicon2!==e.target.parentNode.parentNode.querySelector(".custom-tree-node span").innerText){
            this.expandicon2 = e.target.parentNode.parentNode.querySelector(".custom-tree-node span").innerText;
          }else{
            this.expandicon2 =-1;
          }
        },
        //保证点击热点管理的场景时获得相对应的场景
        newChangeImgFile(item){
          for (let i = 0; i <this.Tree.length ; i++) {
            if(item.label===this.Tree[i].label){
              let title = this.$store.state.test.fileUrlArr[i].fileName;
              let src = this.$store.state.test.fileUrlArr[i].fileUrl;
              this.$store.commit('saveimgFile',{'fileName':title,'fileUrl':[src]});
            }
          }
        },
        //保证点击热点管理的场景时获得相对应的场景
        activeHotSpot(child1){
          if(child1.children[0].pid===4){
            this.$store.commit('showActiveJumpSpot',child1);
          }
          if(child1.children[0].pid===6){
            this.$store.commit('showActiveImageSpot',child1);
          }
          if(child1.children[0].pid===7){
            this.$store.commit('showActiveUrlSpot',child1);
          }
        },
        //热点管理的场景删除
        deleteScene(item,index) {
          this.$store.commit('deleteScene',index);
        },
        changeImgFile(event){
          let src=event.target.getAttribute('src');
          let title=event.target.getAttribute('title');
          this.$store.commit('saveimgFile',{'fileName':title,'fileUrl':[src]});
        },
        //全景图上传成功后的回调函数
        panoUploadSuccess (response, file, fileList) {
            console.log('上传全景文件', response);
            //上传成功后再次请求后端，查询这个viewNo下的所有全景图返回回来
            let that=this;
            that.$ajax({
                url:'/web/file/1/'+that.$store.state.test.viewNo,
                method:'get',
                params:{
                    summary:1
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                }
            }).then(function (response) {
                //将返回的文件名和路径保存进state中
                let file=response.data.data;
                //console.log(file);
                let arr=[];
                for(let i of file){
                    let obj={};
                    obj.fileName=i.name;
                    obj.fileUrl='http://172.28.211.16:8010/'+i.url;
                    arr.push(obj);
                }
                that.$store.commit('saveFileUrlArr',arr);
            }).catch(function (error) {
                console.log(error);
            });

        },
        imgUploadSuccess (response, file, fileList) {
            console.log('上传图片文件', response);
            //这里上传图片后要更新state.hotSpotsImgs
            //上传成功后再次请求后端，查询这个viewNo下的所有贴图返回回来
            let that=this;
            that.$ajax({
                url:'/web/file/1/'+that.$store.state.test.viewNo,
                method:'get',
                params:{
                  summary:2
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                }
            }).then(function (response) {
                //将返回的文件名和路径保存进state中
                let file=response.data.data;
                console.log('已上传的贴图',file);
                let arr=[];
                let tempArr=[];
                for(let i of file){
                    let obj={};
                    obj.key=i.name;
                    obj.value=i.name;
                    // obj.fileUrl='http://172.28.211.16:8010/'+i.url;
                    arr.push(obj);
                    let obj2={};
                    obj2.fileName=i.name;
                    obj2.fileUrl=i.url;
                    tempArr.push(obj2);
                }
                that.$store.commit('saveHotSpotsImgs',arr);
                that.$store.commit('saveTietu',tempArr);
            }).catch(function (error) {
                console.log(error);
            });
        },
        // 上传错误
        uploadError (response, file, fileList) {
            alert('上传失败，请重试！');
        },
        //删除之前提示
        beforeRemove(file, fileList) {
            return this.$confirm(`确定移除 ${ file.name }？`);
        },
        //删除全景图后执行的函数
        panoHandleRemove(file, fileList) {
            //删除文件后更新state.fileUrlArr
            let fileName=file.name;
            let fileUrlArr=this.$store.state.test.fileUrlArr;
            for(let i=0,len=fileUrlArr.length;i<len;i++){
                if(fileUrlArr[i].fileName==fileName){
                    fileUrlArr.splice(i,1);
                }
            }
            this.$store.commit('saveFileUrlArr',fileUrlArr);
        },
        imgHandleRemove(file, fileList) {
          //删除上传的图片文件后更新state.hotSpotsImgs,暂时未实现
          let fileName=file.name;
          let hotSpotsImg=this.$store.state.test.hotSpotsImg;
          for(let i=0,len=hotSpotsImg.length;i<len;i++){
              if(hotSpotsImg[i].value==fileName){
                  hotSpotsImg.splice(i,1);
              }
          }
          this.$store.commit('saveFileUrlArr',hotSpotsImg);

        },
        saveJumpHotSpot(){
          //如果保存的内容不为空，才能点击确定
          if(this.$store.state.test.selectJumpScene&&this.$store.state.test.inputHotIntroduction){
            //点击热点，获得其相应的TempLocation，判断与已有的热点是否相同，相同则修改不相同则Push到state数组中
            this.value2='';//清空select框中的值避免受到影响
            let flag = false;
            let index = -1;
            for (let i = 0; i < this.$store.state.test.jumpHotSpots.length ; i++) {
              if(Math.round(this.$store.state.test.jumpHotSpots[i].position[0])===Math.round(this.$store.state.test.tempLocation.location[0])&&Math.round(this.$store.state.test.jumpHotSpots[i].position[1])===Math.round(this.$store.state.test.tempLocation.location[1])&&Math.round(this.$store.state.test.jumpHotSpots[i].position[2])===Math.round(this.$store.state.test.tempLocation.location[2])){
                flag=true;
                index=i;
              }
            }
            if(flag){
              //把修改的热点信息保存到state中
              this.$store.commit('changeJumpHotSpot',{index:index,hotTarget:this.$store.state.test.selectJumpScene,hotIntroduction:this.$store.state.test.inputHotIntroduction});
              //把修改的热点信息保存到state的Tree中
              this.$store.commit('changeTreeJumpHotSpot',{scene:this.Scene,index:index,hotTarget:this.$store.state.test.selectJumpScene,hotIntroduction:this.$store.state.test.inputHotIntroduction});
            }else{
              //把新增的热点信息保存到state中
              this.$store.commit('saveJumpHotSpot',{hotTarget:this.$store.state.test.selectJumpScene,hotIntroduction:this.$store.state.test.inputHotIntroduction});
              //把新增的热点信息保存到Tree中
              this.$store.commit('saveTreeJumpHotSpot',{scene:this.Scene,hotTarget:this.$store.state.test.selectJumpScene,hotIntroduction:this.$store.state.test.inputHotIntroduction});
            }
            this.$store.commit('hideHotSpot');
          }else {
            alert("请添加跳转场景和者热点说明！");
          }
        },
        saveUrlHotSpot(){
          //如果未改变热点类型，则只需要判断添加热点还是消除热点
          if(this.$store.state.test.selectHotType==='URL热点'){
            //如果保存的内容不为空，才能点击确定
            if(this.$store.state.test.inputHotUrl&&this.$store.state.test.selectHotType) {
              //点击热点，获得其相应的TempLocation，判断与已有的热点是否相同，相同则修改不相同则Push到state数组中
              this.value1 = '';
              this.value = '';//清空select框中的值避免受到影响
              let flag = false;
              let index = -1;
              for (let i = 0; i < this.$store.state.test.urlHotSpots.length; i++) {
                if (Math.round(this.$store.state.test.urlHotSpots[i].position[0].x) === Math.round(this.$store.state.test.tempLocation.location[0].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[0].y) === Math.round(this.$store.state.test.tempLocation.location[0].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[0].z) === Math.round(this.$store.state.test.tempLocation.location[0].z)) {
                  if (Math.round(this.$store.state.test.urlHotSpots[i].position[1].x) === Math.round(this.$store.state.test.tempLocation.location[1].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[1].y) === Math.round(this.$store.state.test.tempLocation.location[1].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[1].z) === Math.round(this.$store.state.test.tempLocation.location[1].z)) {
                    if (Math.round(this.$store.state.test.urlHotSpots[i].position[2].x) === Math.round(this.$store.state.test.tempLocation.location[2].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[2].y) === Math.round(this.$store.state.test.tempLocation.location[2].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[2].z) === Math.round(this.$store.state.test.tempLocation.location[2].z)) {
                      if (Math.round(this.$store.state.test.urlHotSpots[i].position[3].x) === Math.round(this.$store.state.test.tempLocation.location[3].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[3].y) === Math.round(this.$store.state.test.tempLocation.location[3].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[3].z) === Math.round(this.$store.state.test.tempLocation.location[3].z)) {
                        flag = true;
                        index = i;
                      }
                    }
                  }
                }
              }
              if (flag) {
                this.$store.commit('changeUrlHotSpot', {index: index, hotUrl: this.$store.state.test.inputHotUrl});
                this.$store.commit('changeTreeUrlHotSpot', {
                  scene: this.Scene,
                  index: index,
                  hotUrl: this.$store.state.test.inputHotUrl
                });
              } else {
                this.$store.commit('saveUrlHotSpot', {hotUrl: this.$store.state.test.inputHotUrl});
                this.$store.commit('saveTreeUrlHotSpot', {scene: this.Scene, hotUrl: this.$store.state.test.inputHotUrl});
              }
              this.$store.commit('hideHotSpot');
            }else {
              alert("请确定热点类型和跳转链接！");
            }
          }
          //如果改变热点类型，则需要把之前的URL热点删掉，并且把新增的图像热点添加进去(通过selectHotType无法判断)

          // if(this.$store.state.test.selectHotType==='图像热点'){
          //     //如果保存的内容不为空，才能点击确定
          //     if(this.$store.state.test.selectUploadPicture&&this.$store.state.test.selectHotType) {
          //       //如果改变热点类型，则需要把之前的URL热点删掉
          //       this.value1 = '';
          //       this.value = '';//清空select框中的值避免受到影响
          //       let flag = false;
          //       let index = -1;
          //       for (let i = 0; i < this.$store.state.test.urlHotSpots.length; i++) {
          //         if (Math.round(this.$store.state.test.urlHotSpots[i].position[0].x) === Math.round(this.$store.state.test.tempLocation.location[0].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[0].y) === Math.round(this.$store.state.test.tempLocation.location[0].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[0].z) === Math.round(this.$store.state.test.tempLocation.location[0].z)) {
          //           if (Math.round(this.$store.state.test.urlHotSpots[i].position[1].x) === Math.round(this.$store.state.test.tempLocation.location[1].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[1].y) === Math.round(this.$store.state.test.tempLocation.location[1].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[1].z) === Math.round(this.$store.state.test.tempLocation.location[1].z)) {
          //             if (Math.round(this.$store.state.test.urlHotSpots[i].position[2].x) === Math.round(this.$store.state.test.tempLocation.location[2].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[2].y) === Math.round(this.$store.state.test.tempLocation.location[2].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[2].z) === Math.round(this.$store.state.test.tempLocation.location[2].z)) {
          //               if (Math.round(this.$store.state.test.urlHotSpots[i].position[3].x) === Math.round(this.$store.state.test.tempLocation.location[3].x) && Math.round(this.$store.state.test.urlHotSpots[i].position[3].y) === Math.round(this.$store.state.test.tempLocation.location[3].y) && Math.round(this.$store.state.test.urlHotSpots[i].position[3].z) === Math.round(this.$store.state.test.tempLocation.location[3].z)) {
          //                 flag = true;
          //                 index = i;
          //               }
          //             }
          //           }
          //         }
          //       }
          //       //把Tree中的热点信息移除
          //       this.$store.commit('deleteUrlHotSpot', {scene: this.Scene, index: index});
          //       //把场景的热点进行删除
          //       this.$store.commit('newDeleteHotSpot', {
          //         position: this.$store.state.test.tempLocation.location,
          //         pid: 7
          //       });
          //       //并且把新增的图像热点添加进去
          //       this.$store.commit('saveImageHotSpot', {hotImage: this.$store.state.test.selectUploadPicture});
          //       this.$store.commit('saveTreeImageHotSpot', {scene: this.Scene, hotImage: this.$store.state.test.selectUploadPicture});
          //       this.$store.commit('hideHotSpot');
          //     }else {
          //       alert("请确定热点类型和已上传图片！");
          //     }
          //   }
        },
        saveImageHotSpot(){
          //如果未改变热点类型，则只需要判断添加热点还是消除热点
          if(this.$store.state.test.selectHotType==='图像热点'){
            //如果保存的内容不为空，才能点击确定
            if(this.$store.state.test.selectUploadPicture&&this.$store.state.test.selectHotType){
              //点击热点，获得其相应的TempLocation，判断与已有的热点是否相同，相同则修改不相同则Push到state数组中
              this.value1='';this.value='';//清空select框中的值避免受到影响
              let flag = false;
              let index = -1;
              for (let i = 0; i < this.$store.state.test.imageHotSpots.length; i++) {
                if (Math.round(this.$store.state.test.imageHotSpots[i].position[0].x) === Math.round(this.$store.state.test.tempLocation.location[0].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[0].y) === Math.round(this.$store.state.test.tempLocation.location[0].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[0].z) === Math.round(this.$store.state.test.tempLocation.location[0].z)) {
                  if (Math.round(this.$store.state.test.imageHotSpots[i].position[1].x) === Math.round(this.$store.state.test.tempLocation.location[1].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[1].y) === Math.round(this.$store.state.test.tempLocation.location[1].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[1].z) === Math.round(this.$store.state.test.tempLocation.location[1].z)) {
                    if (Math.round(this.$store.state.test.imageHotSpots[i].position[2].x) === Math.round(this.$store.state.test.tempLocation.location[2].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[2].y) === Math.round(this.$store.state.test.tempLocation.location[2].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[2].z) === Math.round(this.$store.state.test.tempLocation.location[2].z)) {
                      if (Math.round(this.$store.state.test.imageHotSpots[i].position[3].x) === Math.round(this.$store.state.test.tempLocation.location[3].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[3].y) === Math.round(this.$store.state.test.tempLocation.location[3].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[3].z) === Math.round(this.$store.state.test.tempLocation.location[3].z)) {
                        flag=true;
                        index=i;
                      }
                    }
                  }
                }
              }
              if(flag){
                this.$store.commit('changeImageHotSpot',{index:index,hotImage:this.$store.state.test.selectUploadPicture});
                this.$store.commit('changeTreeImageHotSpot',{scene:this.Scene,index:index,hotImage:this.$store.state.test.selectUploadPicture});
              }else{
                this.$store.commit('saveImageHotSpot',{hotImage:this.$store.state.test.selectUploadPicture});
                this.$store.commit('saveTreeImageHotSpot',{scene:this.Scene,hotImage:this.$store.state.test.selectUploadPicture});
              }
              this.$store.commit('hideHotSpot');
            }else {
              alert("请确定热点类型和已上传图片！");
            }
          }
          //如果改变热点类型，则需要把之前的URL热点删掉，并且把新增的图像热点添加进去(通过selectHotType无法判断)

          // if(this.$store.state.test.selectHotType==='URL热点'){
          //   if(this.$store.state.test.inputHotUrl&&this.$store.state.test.selectHotType){
          //     //如果改变热点类型，则需要把之前的图像热点删掉
          //     this.value1='';this.value='';//清空select框中的值避免受到影响
          //     let flag = false;
          //     let index = -1;
          //     for (let i = 0; i < this.$store.state.test.imageHotSpots.length; i++) {
          //       if (Math.round(this.$store.state.test.imageHotSpots[i].position[0].x) === Math.round(this.$store.state.test.tempLocation.location[0].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[0].y) === Math.round(this.$store.state.test.tempLocation.location[0].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[0].z) === Math.round(this.$store.state.test.tempLocation.location[0].z)) {
          //         if (Math.round(this.$store.state.test.imageHotSpots[i].position[1].x) === Math.round(this.$store.state.test.tempLocation.location[1].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[1].y) === Math.round(this.$store.state.test.tempLocation.location[1].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[1].z) === Math.round(this.$store.state.test.tempLocation.location[1].z)) {
          //           if (Math.round(this.$store.state.test.imageHotSpots[i].position[2].x) === Math.round(this.$store.state.test.tempLocation.location[2].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[2].y) === Math.round(this.$store.state.test.tempLocation.location[2].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[2].z) === Math.round(this.$store.state.test.tempLocation.location[2].z)) {
          //             if (Math.round(this.$store.state.test.imageHotSpots[i].position[3].x) === Math.round(this.$store.state.test.tempLocation.location[3].x) && Math.round(this.$store.state.test.imageHotSpots[i].position[3].y) === Math.round(this.$store.state.test.tempLocation.location[3].y) && Math.round(this.$store.state.test.imageHotSpots[i].position[3].z) === Math.round(this.$store.state.test.tempLocation.location[3].z)) {
          //               flag=true;
          //               index=i;
          //             }
          //           }
          //         }
          //       }
          //     }
          //     //把Tree中的热点信息移除
          //     this.$store.commit('deleteImageHotSpot',{scene:this.Scene,index:index});
          //     //把场景的热点进行删除
          //     this.$store.commit('newDeleteHotSpot',{
          //       position:this.$store.state.test.tempLocation.location,
          //       pid:6
          //     });
          //     //并且把新增的URL热点添加进去
          //     this.$store.commit('saveUrlHotSpot',{hotUrl:this.$store.state.test.inputHotUrl});
          //     this.$store.commit('saveTreeUrlHotSpot',{scene:this.Scene,hotUrl:this.$store.state.test.inputHotUrl});
          //     this.$store.commit('hideHotSpot');
          //   }else {
          //     alert("请确定热点类型和跳转链接！");
          //   }
          // }

        },
        //将新建项目的输入框参数传给后台，返回一个表示项目的id==>viewNo
        // sendProject(){
        //     let that=this;
        //     this.$ajax({
        //         url:'/web/spaceview/',
        //         method: 'post',
        //         data: {
        //             shortName: that.shortName,
        //             address: that.address,
        //             longitude:that.longitude,
        //             latitude:that.latitude,
        //             info:that.info,
        //             createUserNo:that.createUserNo,
        //             companyNo:that.companyNo,
        //             _token:that.token,
        //             viewType:0,
        //             status:1
        //         },
        //         transformRequest: [function (data) {
        //             // Do whatever you want to transform the data
        //             let ret = ''
        //             for (let it in data) {
        //                 ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        //             }
        //             return ret
        //         }],
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        //         }
        //     }).then(function (response) {
        //             let viewNo=response.data.data;
        //             that.$store.commit('saveViewNo',{viewNo:viewNo});
        //             console.log(viewNo);
        //
        //     }).catch(function (error) {
        //             console.log(error);
        //     });
        // }
      },
      data() {
        return {
            defaultTarget:'',
            // hotTarget:'',
            //hotIntroduction:'',
            // hotSpotsImg:'',
            // hotUrl:'',
            // hotSpotsType:'',
            hotSpotsTypes:[{'key':'URL热点','value':'URL热点'},{'key':'图像热点','value':'图像热点'}],
            // shortName:'',
            // address:'',
            // longitude:'',
            // latitude:'',
            // info:'',
            //这里暂时写死
            createUserNo:"84d2a1ed-d26e-4772-a296-ce8c111132d4",
            companyNo:"84d2a1ed-d26e-4772-a296-ce8c111132d4",
            token:"4KD8DLL84D2A1ED-D26E-4772-A296-CE8C111132D4",

            //这个是什么没看懂
          pickerOptions0: {
            disabledDate(time) {
              return time.getTime() < Date.now() - 8.64e7;
            }
          },

          hotSpotsImgs:[{'key':'tianyu01.jpg','value':'tianyu01.jpg','label':'tianyu01.jpg'},{'key':'tianyu02.jpg','value':'tianyu02.jpg','label':'tianyu02.jpg'}],//选择上传图片
          //定义select选中值,选择器需要value值
          value: '',
          value1:'',
          value2:'',
          expandicon:-1,expandicon1:-1,expandicon2:-1,//是否展开
          //用于添加场景的表单弹出框
          dialogFormVisible: false,//用于弹出框
          formLabelWidth: '120px',

          // 水平平移倍率的选择
          optionsX: [{
            value: '1',
            label: '×1'
          }, {
            value: '10',
            label: '×10'
          }, {
            value: '100',
            label: '×100'
          }],
          Xvalue:1,//将change函数的选中值传递给status,默认是1
          valueX:'1',//默认选中
          // 垂直平移倍率的选择
          optionsY: [{
            value: '1',
            label: '×1'
          }, {
            value: '10',
            label: '×10'
          }, {
            value: '100',
            label: '×100'
          }],
          Yvalue:1,//将change函数的选中值传递给status,默认是1
          valueY:'1',//默认选中
          // 旋转倍率的选择
          optionsR: [{
            value: '1',
            label: '×1°'
          }, {
            value: '10',
            label: '×10°'
          }],
          Rvalue:1,//将change函数的选中值传递给status,默认是1
          valueR:'1',//默认选中
          // 放缩倍率的选择
          optionsS: [{
            value: '0.1',
            label: '0.1'
          }, {
            value: '0.5',
            label: '0.5'
          }],
          Svalue:0.1,//将change函数的选中值传递给status,默认是1
          valueS:'0.1',//默认选中

        }
      },
    }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
    .sidelogo{
        height:50px;
        line-height:50px;
        padding:0 10px 0 10px;
    }
    .sidelogotxt{
        font-size:1.2rem;
        font-weight:bold;
    }
    .sidetitle{
        padding:10px 0 10px 0;
        color:#999;
        font-size:1rem;
        font-weight:bold;
    }
    .el-menu {
        min-height: 100%;
    }
    .sideItem{
        border-bottom:1px dashed #ccc;
        padding-bottom: 10px;
    }
    .el-form-item{
        margin-bottom:10px;
    }
    .el-checkbox{margin-left:0;
    }
    .el-checkbox__label{font-weight:normal;
    }
    .el-date-editor.el-input{
        width: 100%;
    }

    /*平移输入框样式*/
    .transfrom{
      overflow: hidden;
      position: relative;
      width: 248px;
      margin-top: 10px;
    }
    .up,.down{
      border:0;
      cursor: pointer;
      display: inline-block;
      color:#BFCBD9;
      background-color: #fff;
      /*outline: none;*/
      height: 12px;
      padding: 0;
    }
    .down{
      position: absolute;
      top: 8px;
      right:5px;
    }
    .up{
      position: absolute;
      top: 8px;
      right:35px;
    }
    #txtNumberX,#txtNumberY,#txtNumberSS,#txtNumberRR{
      width:100px;
    }
    #txtNumberR,#txtNumberS {
      height:30px;width:100px;float:left;display: block;border-radius:4px;
      border: 1px solid #bfcbd9;outline:none;box-sizing: border-box;
      padding:3px 10px 3px 10px;vertical-align:middle; color:#97BBE0; font-size:14px;
    }
    label {
      font-weight:700;
      color:#48576A;
      font-size:14px;
      float: left;
      line-height: 30px;
      box-sizing: border-box;
      width: 80px;
      height:30px;
      text-align:center;
    }
    input:disabled {
      background-color: #f5f7fa;
      border-color: #e4e7ed;
      color: #c0c4cc;
      cursor: not-allowed;
    }
</style>
